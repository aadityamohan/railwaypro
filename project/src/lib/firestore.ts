import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser } from '@/types'

// Top-level collections
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
} as const

// Sub-collections under companies/{companyId}/
export const SUB = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  WORKERS: 'workers',
  EQUIPMENT: 'equipment',
  INVENTORY: 'inventory',
  INCIDENTS: 'incidents',
  AUDIT_LOGS: 'auditLogs',
  SAFETY_CHECKLIST: 'safetyChecklist',
  WEEKLY_REPORTS: 'weeklyReports',
  RETAILERS: 'retailers',
} as const

// Generic helpers
export const colRef = (col: string) => collection(db, col)
export const docRef = (col: string, id: string) => doc(db, col, id)

// Company-scoped helpers
export const cColRef = (companyId: string, sub: string) =>
  collection(db, COLLECTIONS.COMPANIES, companyId, sub)
export const cDocRef = (companyId: string, sub: string, id: string) =>
  doc(db, COLLECTIONS.COMPANIES, companyId, sub, id)

// Company CRUD
function genCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createCompany(name: string, user: AppUser): Promise<string> {
  const code = genCode()
  const companyRef = doc(db, COLLECTIONS.COMPANIES, code)
  await setDoc(companyRef, {
    name,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })
  // Update user doc with companyId + companyName + promote to admin
  await setDoc(
    docRef(COLLECTIONS.USERS, user.uid),
    { companyId: code, companyName: name, role: 'admin' },
    { merge: true }
  )
  return code
}

export async function joinCompany(
  code: string,
  user: AppUser
): Promise<{ name: string }> {
  const companySnap = await getDoc(doc(db, COLLECTIONS.COMPANIES, code.toUpperCase()))
  if (!companySnap.exists()) throw new Error('Company not found. Check the invite code.')
  const companyName = (companySnap.data().name as string) ?? ''
  await setDoc(
    docRef(COLLECTIONS.USERS, user.uid),
    { companyId: code.toUpperCase(), companyName },
    { merge: true }
  )
  return { name: companyName }
}

// Audit log writer — fire-and-forget so failures don't block operations
export function writeAuditLog(
  user: AppUser,
  action: string,
  entity: string,
  entityId: string,
  details?: string
) {
  if (!user?.uid) {
    console.warn('[auditLog] skipped: user.uid is missing')
    return
  }
  if (!user?.companyId) {
    console.warn('[auditLog] skipped: user.companyId is missing')
    return
  }
  try {
    addDoc(cColRef(user.companyId, SUB.AUDIT_LOGS), {
      action,
      entity,
      entityId,
      userId: user.uid,
      userName: user.name ?? '',
      timestamp: serverTimestamp(),
      details: details ?? '',
    }).catch((err) => console.error('[auditLog] write failed:', err))
  } catch (err) {
    console.error('[auditLog] setup error:', err)
  }
}

// Projects
export async function createProject(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.PROJECTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'project', ref.id, `Created project: ${data.name}`)
  return ref.id
}

export async function updateProject(id: string, data: Record<string, unknown>, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.PROJECTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'project', id, `Updated project`)
}

export async function deleteProject(id: string, user: AppUser) {
  await deleteDoc(cDocRef(user.companyId!, SUB.PROJECTS, id))
  writeAuditLog(user, 'deleted', 'project', id, `Deleted project`)
}

// Tasks
export async function createTask(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.TASKS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'task', ref.id, `Created task: ${data.title}`)
  return ref.id
}

export async function updateTask(id: string, data: Record<string, unknown>, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.TASKS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'task', id, `Updated task`)
}

// Workers
export async function createWorker(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.WORKERS), {
    ...data,
    createdAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'worker', ref.id, `Added worker: ${data.name}`)
  return ref.id
}

export async function updateWorker(id: string, data: Record<string, unknown>, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.WORKERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'worker', id, `Updated worker`)
}

export async function deleteWorker(id: string, user: AppUser) {
  await deleteDoc(cDocRef(user.companyId!, SUB.WORKERS, id))
  writeAuditLog(user, 'deleted', 'worker', id, `Deleted worker`)
}

// Equipment
export async function createEquipment(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.EQUIPMENT), {
    ...data,
    createdAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'equipment', ref.id, `Added equipment: ${data.name}`)
  return ref.id
}

export async function updateEquipment(id: string, data: Record<string, unknown>, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.EQUIPMENT, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'equipment', id, `Updated equipment`)
}

// Inventory
export async function createInventoryItem(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.INVENTORY), {
    ...data,
    createdAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'inventory', ref.id, `Added inventory item: ${data.name}`)
  return ref.id
}

export async function updateInventoryItem(id: string, data: Record<string, unknown>, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.INVENTORY, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'inventory', id, `Updated inventory item`)
}

// Incidents
export async function createIncident(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.INCIDENTS), {
    ...data,
    createdAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'incident', ref.id, `Logged incident`)
  return ref.id
}

// Safety checklist
export async function upsertChecklistItem(
  date: string,
  itemId: string,
  checked: boolean,
  user: AppUser
) {
  const id = `${user.uid}_${date}_${itemId}`
  await setDoc(
    cDocRef(user.companyId!, SUB.SAFETY_CHECKLIST, id),
    { userId: user.uid, date, itemId, checked, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// Retailers / Payments
export async function createRetailer(data: Record<string, unknown>, user: AppUser) {
  const ref = await addDoc(cColRef(user.companyId!, SUB.RETAILERS), {
    ...data,
    payments: [],
    createdAt: serverTimestamp(),
  })
  writeAuditLog(user, 'created', 'retailer', ref.id, `Added retailer: ${data.name}`)
  return ref.id
}

export async function recordPayment(
  id: string,
  payments: { amount: number; date: string; note?: string }[],
  user: AppUser
) {
  await updateDoc(cDocRef(user.companyId!, SUB.RETAILERS, id), {
    payments,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'payment_recorded', 'retailer', id, `Recorded payment`)
}

export async function updateRetailerDue(id: string, totalDue: number, user: AppUser) {
  await updateDoc(cDocRef(user.companyId!, SUB.RETAILERS, id), {
    totalDue,
    updatedAt: serverTimestamp(),
  })
  writeAuditLog(user, 'updated', 'retailer', id, `Updated total due`)
}

export async function deleteRetailer(id: string, user: AppUser) {
  await deleteDoc(cDocRef(user.companyId!, SUB.RETAILERS, id))
  writeAuditLog(user, 'deleted', 'retailer', id, `Deleted retailer`)
}

// Recent audit logs query factory
export function recentAuditLogsQuery(companyId: string) {
  return query(cColRef(companyId, SUB.AUDIT_LOGS), orderBy('timestamp', 'desc'), limit(4))
}

export function tsToString(ts: Timestamp | string | null | undefined): string {
  if (!ts) return ''
  if (typeof ts === 'string') return ts
  return ts.toDate().toISOString()
}
