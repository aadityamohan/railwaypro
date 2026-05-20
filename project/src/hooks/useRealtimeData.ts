import { useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { cColRef, SUB, tsToString } from '@/lib/firestore'
import { useStore, useCurrentUser } from '@/store'
import type {
  Project,
  Task,
  Worker,
  Equipment,
  InventoryItem,
  Incident,
  AuditLog,
  Retailer,
} from '@/types'

function snapToArr<T>(snap: { docs: { id: string; data: () => Record<string, unknown> }[] }): T[] {
  return snap.docs.map((d) => {
    const data = d.data()
    const converted: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && 'toDate' in v && typeof (v as { toDate: unknown }).toDate === 'function') {
        converted[k] = tsToString(v as Parameters<typeof tsToString>[0])
      } else {
        converted[k] = v
      }
    }
    return { id: d.id, ...converted } as T
  })
}

const onErr = (col: string) => (err: Error) => console.error(`[${col}] snapshot error:`, err)

export function useRealtimeData() {
  const currentUser = useCurrentUser()
  const { setProjects, setTasks, setWorkers, setEquipment, setInventory, setIncidents, setAuditLogs, setRetailers } =
    useStore()

  const companyId = currentUser?.companyId

  useEffect(() => {
    if (!companyId) return

    const unsubs: (() => void)[] = []

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.PROJECTS), orderBy('createdAt', 'desc')), (snap) => {
        setProjects(snapToArr<Project>(snap))
      }, onErr('projects'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.TASKS), orderBy('createdAt', 'desc')), (snap) => {
        setTasks(snapToArr<Task>(snap))
      }, onErr('tasks'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.WORKERS), orderBy('name', 'asc')), (snap) => {
        setWorkers(snapToArr<Worker>(snap))
      }, onErr('workers'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.EQUIPMENT), orderBy('name', 'asc')), (snap) => {
        setEquipment(snapToArr<Equipment>(snap))
      }, onErr('equipment'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.INVENTORY), orderBy('name', 'asc')), (snap) => {
        setInventory(snapToArr<InventoryItem>(snap))
      }, onErr('inventory'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.INCIDENTS), orderBy('createdAt', 'desc')), (snap) => {
        setIncidents(snapToArr<Incident>(snap))
      }, onErr('incidents'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.AUDIT_LOGS), orderBy('timestamp', 'desc')), (snap) => {
        setAuditLogs(snapToArr<AuditLog>(snap))
      }, onErr('auditLogs'))
    )

    unsubs.push(
      onSnapshot(query(cColRef(companyId, SUB.RETAILERS), orderBy('createdAt', 'desc')), (snap) => {
        setRetailers(snapToArr<Retailer>(snap))
      }, onErr('retailers'))
    )

    return () => unsubs.forEach((u) => u())
  }, [companyId, setProjects, setTasks, setWorkers, setEquipment, setInventory, setIncidents, setAuditLogs, setRetailers])
}
