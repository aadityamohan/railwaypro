/**
 * Dummy seed script — creates test auth users + company-scoped data.
 *
 * Requirements:
 *   1. A Firebase service account JSON saved at:
 *      project/serviceAccountKey.json   (already in .gitignore)
 *      Download from: Firebase Console → Project Settings → Service Accounts
 *                     → Generate new private key
 *   2. Run from project/ directory:
 *      npm run seed:dummy
 *
 * What this script creates (idempotently — safe to re-run):
 *   - Company: companies/RB2026  (code: RB2026)
 *   - Auth users:
 *       admin@demo.test   / Demo1234!   role=admin
 *       manager@demo.test / Demo1234!   role=manager
 *       worker@demo.test  / Demo1234!   role=worker
 *   - users/{uid} docs for each (with companyId=RB2026)
 *   - companies/RB2026/{projects, workers, equipment, inventory, tasks,
 *                      incidents, retailers, weeklyReports}
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const KEY_PATH = resolve(process.cwd(), 'serviceAccountKey.json')
if (!existsSync(KEY_PATH)) {
  console.error(`Service account key not found at: ${KEY_PATH}`)
  console.error('Download it from Firebase Console → Project Settings → Service Accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'))
initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
})

const db = getFirestore()
const auth = getAuth()
const ts = FieldValue.serverTimestamp

// ── CONFIG ────────────────────────────────────────────────────────────────
const COMPANY_CODE = 'RB2026'
const COMPANY_NAME = 'RailBuild Demo Co.'
const PASSWORD = 'Demo1234!'

type Role = 'admin' | 'manager' | 'worker'
const TEST_USERS: { email: string; name: string; role: Role }[] = [
  { email: 'admin@demo.test',   name: 'Aarav Admin',     role: 'admin' },
  { email: 'manager@demo.test', name: 'Meera Manager',   role: 'manager' },
  { email: 'worker@demo.test',  name: 'Wasim Worker',    role: 'worker' },
]

const daysFromNow = (n: number) =>
  Timestamp.fromMillis(Date.now() + n * 86_400_000)

// ── HELPERS ───────────────────────────────────────────────────────────────
async function getOrCreateAuthUser(email: string, password: string, displayName: string) {
  try {
    const user = await auth.getUserByEmail(email)
    // Reset password so tests are reliable
    await auth.updateUser(user.uid, { password, displayName, emailVerified: true })
    console.log(`  ↻ Auth user exists, password reset: ${email}`)
    return user
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      const user = await auth.createUser({ email, password, displayName, emailVerified: true })
      console.log(`  + Auth user created: ${email}`)
      return user
    }
    throw err
  }
}

async function deleteSubcollection(companyId: string, sub: string) {
  const snap = await db.collection('companies').doc(companyId).collection(sub).get()
  if (snap.empty) return
  const batch = db.batch()
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
  console.log(`  - Cleared companies/${companyId}/${sub} (${snap.size} docs)`)
}

// ── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeeding project: ${serviceAccount.project_id}`)
  console.log(`Company code:    ${COMPANY_CODE}\n`)

  // 1. Company doc
  await db.collection('companies').doc(COMPANY_CODE).set({
    name: COMPANY_NAME,
    createdBy: 'seed-script',
    createdAt: ts(),
  })
  console.log(`✓ Company ready: ${COMPANY_CODE} (${COMPANY_NAME})\n`)

  // 2. Auth users + user docs
  console.log('Setting up auth users:')
  const createdUsers: { uid: string; email: string; name: string; role: Role }[] = []
  for (const u of TEST_USERS) {
    const authUser = await getOrCreateAuthUser(u.email, PASSWORD, u.name)
    await db.collection('users').doc(authUser.uid).set({
      uid: authUser.uid,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarInitials: u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
      companyId: COMPANY_CODE,
      companyName: COMPANY_NAME,
    })
    createdUsers.push({ uid: authUser.uid, ...u })
  }
  console.log()

  const adminUser = createdUsers.find(u => u.role === 'admin')!

  // 3. Wipe + reseed company subcollections
  console.log('Clearing existing dummy data:')
  for (const sub of ['projects','workers','equipment','inventory','tasks','incidents','retailers','weeklyReports','auditLogs']) {
    await deleteSubcollection(COMPANY_CODE, sub)
  }
  console.log()

  const colRef = (sub: string) =>
    db.collection('companies').doc(COMPANY_CODE).collection(sub)

  // 4. Projects
  console.log('Seeding projects:')
  const projects = [
    { name: 'Mumbai–Pune HSR',          zone: 'Zone 3', type: 'Track Laying', status: 'on_track', progressPercent: 78, budgetCr: 450, budgetUsedCr: 324, workerCount: 24, description: 'High-speed rail corridor km 0–120', startDate: daysFromNow(-180), targetDate: daysFromNow(200) },
    { name: 'Delhi Metro Phase 4',      zone: 'Zone 7', type: 'Bridge Works', status: 'delayed',  progressPercent: 41, budgetCr: 820, budgetUsedCr: 885, workerCount: 18, description: 'Metro corridor — 6 elevated stations', startDate: daysFromNow(-300), targetDate: daysFromNow(-30) },
    { name: 'Ahmedabad–Surat Freight',  zone: 'Zone 1', type: 'Earthworks',   status: 'at_risk',  progressPercent: 55, budgetCr: 290, budgetUsedCr: 255, workerCount: 31, description: 'Dedicated freight corridor (240 km)',  startDate: daysFromNow(-120), targetDate: daysFromNow(120) },
    { name: 'Bangalore Suburban Rail',  zone: 'Zone 2', type: 'Signalling',   status: 'on_track', progressPercent: 89, budgetCr: 180, budgetUsedCr: 117, workerCount: 9,  description: 'BMRCL suburban signalling & OHE',      startDate: daysFromNow(-250), targetDate: daysFromNow(40) },
    { name: 'Chennai Beach Line',       zone: 'Zone 4', type: 'Maintenance',  status: 'completed', progressPercent: 100, budgetCr: 60, budgetUsedCr: 58, workerCount: 0, description: 'Coastal track rehabilitation 28 km',  startDate: daysFromNow(-400), targetDate: daysFromNow(-60) },
  ]
  const projIds: string[] = []
  for (const p of projects) {
    const ref = await colRef('projects').add({ ...p, createdAt: ts(), updatedAt: ts() })
    projIds.push(ref.id)
    console.log(`  + ${p.name}`)
  }
  console.log()

  // 5. Workers
  console.log('Seeding workers:')
  const workers = [
    { name: 'Rajesh Singh',  initials: 'RS', role: 'Site Supervisor',    zone: 'Zone 3', phone: '+91 98100 11111', status: 'active',   hoursToday: 8.5, certifications: ['First Aid', 'Heights'], projectId: projIds[0] },
    { name: 'Priya Kumari',  initials: 'PK', role: 'Track Engineer',     zone: 'Zone 1', phone: '+91 98100 22222', status: 'active',   hoursToday: 6.0, certifications: ['Welding'],              projectId: projIds[2] },
    { name: 'Arjun Mehta',   initials: 'AM', role: 'Machinery Operator', zone: 'Zone 3', phone: '+91 98100 33333', status: 'on_break', hoursToday: 5.0, certifications: ['Heavy Vehicle'],        projectId: projIds[0] },
    { name: 'Neha Khanna',   initials: 'NK', role: 'Safety Inspector',   zone: 'Zone 7', phone: '+91 98100 44444', status: 'absent',   hoursToday: 0,   certifications: ['IOSH', 'NEBOSH'],       projectId: projIds[1] },
    { name: 'Dhruv Verma',   initials: 'DV', role: 'Electrician',        zone: 'Zone 2', phone: '+91 98100 55555', status: 'active',   hoursToday: 6.5, certifications: ['HT Lines'],             projectId: projIds[3] },
    { name: 'Suresh Patil',  initials: 'SP', role: 'Track Labourer',     zone: 'Zone 3', phone: '+91 98100 66666', status: 'active',   hoursToday: 7.0, certifications: [],                       projectId: projIds[0] },
    { name: 'Kavya Iyer',    initials: 'KI', role: 'Site Engineer',      zone: 'Zone 1', phone: '+91 98100 77777', status: 'active',   hoursToday: 8.0, certifications: ['PMP'],                  projectId: projIds[2] },
    { name: 'Vikram Joshi',  initials: 'VJ', role: 'Welder',             zone: 'Zone 2', phone: '+91 98100 88888', status: 'active',   hoursToday: 6.0, certifications: ['Welding', 'NDT'],       projectId: projIds[3] },
  ]
  for (const w of workers) {
    await colRef('workers').add({ ...w, createdAt: ts() })
    console.log(`  + ${w.name}`)
  }
  console.log()

  // 6. Equipment
  console.log('Seeding equipment:')
  const equipment = [
    { name: 'Rail Tamping Machine #1', type: 'heavy_machinery', zone: 'Zone 3', status: 'operational', hoursToday: 6.5, totalHours: 1240, lastServiceDate: daysFromNow(-30), nextServiceDate: daysFromNow(60),  assignedProjectId: projIds[0] },
    { name: 'Mobile Crane MK-200',     type: 'crane',           zone: 'Zone 7', status: 'in_repair',   hoursToday: 0,   totalHours: 2100, lastServiceDate: daysFromNow(-90), nextServiceDate: daysFromNow(-10), assignedProjectId: projIds[1] },
    { name: 'Diesel Generator G-3',    type: 'generator',       zone: 'Zone 1', status: 'service_due', hoursToday: 8.0, totalHours: 3400, lastServiceDate: daysFromNow(-91), nextServiceDate: daysFromNow(-1),  assignedProjectId: projIds[2] },
    { name: 'Excavator JD-350',        type: 'heavy_machinery', zone: 'Zone 1', status: 'operational', hoursToday: 7.2, totalHours: 890,  lastServiceDate: daysFromNow(-20), nextServiceDate: daysFromNow(70),  assignedProjectId: projIds[2] },
    { name: 'Ballast Wagon Train',     type: 'vehicle',         zone: 'Zone 3', status: 'operational', hoursToday: 5.5, totalHours: 560,  lastServiceDate: daysFromNow(-15), nextServiceDate: daysFromNow(75),  assignedProjectId: projIds[0] },
    { name: 'Concrete Mixer CM-12',    type: 'heavy_machinery', zone: 'Zone 7', status: 'operational', hoursToday: 4.0, totalHours: 720,  lastServiceDate: daysFromNow(-10), nextServiceDate: daysFromNow(80),  assignedProjectId: projIds[1] },
  ]
  for (const e of equipment) {
    await colRef('equipment').add({ ...e, createdAt: ts() })
    console.log(`  + ${e.name}`)
  }
  console.log()

  // 7. Inventory
  console.log('Seeding inventory:')
  const inventory = [
    { name: 'Rail Fasteners (Type B)', category: 'track',      quantity: 1200,  unit: 'pcs',  reorderLevel: 2000, status: 'low_stock',    unitCostInr: 45 },
    { name: 'Ballast Grade 3',         category: 'civil',      quantity: 840,   unit: 'MT',   reorderLevel: 1000, status: 'reorder_soon', unitCostInr: 1200 },
    { name: 'Concrete Sleepers',       category: 'track',      quantity: 2450,  unit: 'nos',  reorderLevel: 500,  status: 'ok',           unitCostInr: 3200 },
    { name: 'Steel Rail (UIC 60)',     category: 'track',      quantity: 18000, unit: 'kg',   reorderLevel: 5000, status: 'ok',           unitCostInr: 85 },
    { name: 'Cement M40',              category: 'civil',      quantity: 320,   unit: 'bags', reorderLevel: 500,  status: 'low_stock',    unitCostInr: 420 },
    { name: 'Signalling Cable',        category: 'electrical', quantity: 4200,  unit: 'm',    reorderLevel: 1000, status: 'ok',           unitCostInr: 180 },
    { name: 'Welding Rods',            category: 'track',      quantity: 580,   unit: 'pcs',  reorderLevel: 200,  status: 'ok',           unitCostInr: 25 },
    { name: 'Tie Plates',              category: 'track',      quantity: 95,    unit: 'nos',  reorderLevel: 300,  status: 'low_stock',    unitCostInr: 650 },
    { name: 'OHE Insulators',          category: 'electrical', quantity: 240,   unit: 'pcs',  reorderLevel: 100,  status: 'ok',           unitCostInr: 950 },
  ]
  for (const i of inventory) {
    await colRef('inventory').add({ ...i, createdAt: ts(), lastUpdated: ts() })
    console.log(`  + ${i.name}`)
  }
  console.log()

  // 8. Tasks
  console.log('Seeding tasks:')
  const tasks = [
    { title: 'Survey Zone 4 alignment',  projectId: projIds[0], projectName: projects[0].name, assigneeName: 'Priya Kumari',  status: 'todo',        priority: 'high',   category: 'survey',     dueDate: daysFromNow(14) },
    { title: 'Track laying km 42–47',    projectId: projIds[0], projectName: projects[0].name, assigneeName: 'Arjun Mehta',   status: 'in_progress', priority: 'urgent', category: 'mech',       dueDate: daysFromNow(7) },
    { title: 'Safety briefing Zone 7',   projectId: projIds[1], projectName: projects[1].name, assigneeName: 'Neha Khanna',   status: 'todo',        priority: 'urgent', category: 'safety',     dueDate: daysFromNow(1) },
    { title: 'Girder placement P7–P9',   projectId: projIds[1], projectName: projects[1].name, assigneeName: 'Arjun Mehta',   status: 'in_progress', priority: 'urgent', category: 'civil',      dueDate: daysFromNow(5) },
    { title: 'Embankment compaction',    projectId: projIds[2], projectName: projects[2].name, assigneeName: 'Rajesh Singh',  status: 'in_progress', priority: 'medium', category: 'civil',      dueDate: daysFromNow(10) },
    { title: 'Order ballast Grade 3',    projectId: projIds[2], projectName: projects[2].name, assigneeName: 'Kavya Iyer',    status: 'todo',        priority: 'medium', category: 'inventory',  dueDate: daysFromNow(5) },
    { title: 'Signalling cable routing', projectId: projIds[3], projectName: projects[3].name, assigneeName: 'Dhruv Verma',   status: 'in_progress', priority: 'medium', category: 'electrical', dueDate: daysFromNow(8) },
    { title: 'OHE pole erection',        projectId: projIds[3], projectName: projects[3].name, assigneeName: 'Vikram Joshi',  status: 'todo',        priority: 'high',   category: 'electrical', dueDate: daysFromNow(15) },
    { title: 'Sleeper installation Z3',  projectId: projIds[0], projectName: projects[0].name, assigneeName: 'Rajesh Singh',  status: 'done',        priority: 'high',   category: 'track',      dueDate: daysFromNow(-2), completedAt: daysFromNow(-2) },
    { title: 'Final inspection',         projectId: projIds[4], projectName: projects[4].name, assigneeName: 'Neha Khanna',   status: 'done',        priority: 'medium', category: 'safety',     dueDate: daysFromNow(-30), completedAt: daysFromNow(-30) },
  ]
  for (const t of tasks) {
    await colRef('tasks').add({ ...t, createdAt: ts(), updatedAt: ts() })
    console.log(`  + ${t.title}`)
  }
  console.log()

  // 9. Incidents
  console.log('Seeding incidents:')
  const incidents = [
    { type: 'Minor Injury',         severity: 'low',      zone: 'Zone 3', projectId: projIds[0], description: 'Worker scraped hand on rebar — first aid administered',     reportedBy: adminUser.name, occurredAt: daysFromNow(-3) },
    { type: 'Equipment Damage',     severity: 'medium',   zone: 'Zone 7', projectId: projIds[1], description: 'Crane hydraulic line leaked oil — service initiated',       reportedBy: adminUser.name, occurredAt: daysFromNow(-1) },
    { type: 'Near Miss',            severity: 'high',     zone: 'Zone 1', projectId: projIds[2], description: 'Loose excavator bucket nearly fell on staging area',        reportedBy: adminUser.name, occurredAt: daysFromNow(-7) },
    { type: 'Track Defect',         severity: 'medium',   zone: 'Zone 2', projectId: projIds[3], description: 'Rail head wear above limit at km 14.2 — replacement queued', reportedBy: adminUser.name, occurredAt: daysFromNow(-10) },
  ]
  for (const i of incidents) {
    await colRef('incidents').add({ ...i, createdAt: ts() })
    console.log(`  + ${i.type} (${i.severity})`)
  }
  console.log()

  // 10. Retailers
  console.log('Seeding retailers/payments:')
  const retailers = [
    { projectId: projIds[0], projectName: projects[0].name, name: 'Mumbai Steel Traders',  category: 'Steel & Rail',  totalDue: 2_450_000, payments: [{ amount: 500_000, date: daysFromNow(-20).toDate().toISOString(), note: 'Q1 advance' }] },
    { projectId: projIds[1], projectName: projects[1].name, name: 'Delhi Cement Co.',      category: 'Cement',        totalDue: 1_180_000, payments: [{ amount: 200_000, date: daysFromNow(-15).toDate().toISOString(), note: 'Initial' }] },
    { projectId: projIds[2], projectName: projects[2].name, name: 'Gujarat Ballast Ltd.',  category: 'Aggregates',    totalDue: 3_220_000, payments: [] },
    { projectId: projIds[3], projectName: projects[3].name, name: 'Bangalore Signalling',  category: 'Electrical',    totalDue: 890_000,   payments: [{ amount: 890_000, date: daysFromNow(-5).toDate().toISOString(), note: 'PAID IN FULL' }] },
  ]
  for (const r of retailers) {
    await colRef('retailers').add({ ...r, createdAt: ts() })
    console.log(`  + ${r.name}`)
  }
  console.log()

  // 11. Weekly reports
  console.log('Seeding weekly reports:')
  const weeks = [
    { weekStart: daysFromNow(-21), trackLaidKm: 4.2, budgetUsedCr: 28.5, incidentCount: 1, attendancePercent: 92 },
    { weekStart: daysFromNow(-14), trackLaidKm: 5.1, budgetUsedCr: 31.0, incidentCount: 0, attendancePercent: 95 },
    { weekStart: daysFromNow(-7),  trackLaidKm: 3.8, budgetUsedCr: 26.7, incidentCount: 2, attendancePercent: 88 },
  ]
  for (const w of weeks) {
    await colRef('weeklyReports').add({ ...w, createdAt: ts() })
    console.log(`  + Week starting ${w.weekStart.toDate().toISOString().slice(0,10)}`)
  }
  console.log()

  // ── DONE ────────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  SEED COMPLETE — Dummy sign-in credentials                  ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║  Company code: ${COMPANY_CODE}  (already linked to all 3 users)        ║`)
  console.log('║                                                              ║')
  for (const u of TEST_USERS) {
    console.log(`║  ${u.role.padEnd(8)} → ${u.email.padEnd(22)}  pw: ${PASSWORD}    ║`)
  }
  console.log('╚══════════════════════════════════════════════════════════════╝')

  process.exit(0)
}

main().catch(err => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
