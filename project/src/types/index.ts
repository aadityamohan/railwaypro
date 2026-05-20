export type UserRole = 'admin' | 'manager' | 'worker'

export interface AppUser {
  uid: string
  email: string
  name: string
  role: UserRole
  avatarInitials: string
  companyId?: string
  companyName?: string
}

export interface Company {
  id: string   // = invite code (6-char alphanumeric)
  name: string
  createdBy: string
  createdAt?: string
}

export type ProjectStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed'

export interface Project {
  id: string
  name: string
  zone: string
  type: string
  status: ProjectStatus
  progressPercent: number
  budgetCr: number
  budgetUsedCr: number
  workerCount: number
  startDate: string
  targetDate: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  projectId: string
  projectName: string
  assigneeId: string
  assigneeName: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate: string
  notes?: string
}

export type WorkerStatus = 'active' | 'on_break' | 'absent'

export interface Worker {
  id: string
  name: string
  initials: string
  role: string
  zone: string
  phone: string
  status: WorkerStatus
  hoursToday: number
  certifications: string[]
}

export type EquipmentStatus = 'operational' | 'in_repair' | 'service_due'

export interface Equipment {
  id: string
  name: string
  type: string
  zone: string
  status: EquipmentStatus
  hoursToday: number
  lastServiceDate: string
  nextServiceDate: string
  imageUrl?: string
}

export type InventoryStatus = 'ok' | 'reorder_soon' | 'low_stock'

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  reorderLevel: number
  status: InventoryStatus
  pricePerUnit?: number
  billImageUrl?: string
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Incident {
  id: string
  type: string
  severity: IncidentSeverity
  zone: string
  projectId: string
  description: string
  reportedBy: string
  occurredAt: string
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  timestamp: string
  details?: string
}

export interface SafetyChecklistItem {
  id: string
  label: string
  checked: boolean
  date: string
}

export interface WeeklyReport {
  id: string
  weekStart: string
  trackLaidKm: number
  budgetUsedCr: number
  incidentCount: number
  attendancePercent: number
}

export interface PaymentEntry {
  amount: number
  date: string
  note?: string
}

export interface Retailer {
  id: string
  projectId: string
  projectName: string
  name: string
  category: string
  totalDue: number
  payments: PaymentEntry[]
  createdAt?: string
}
