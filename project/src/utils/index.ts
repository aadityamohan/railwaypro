import type { ProjectStatus, TaskStatus, TaskPriority, WorkerStatus, EquipmentStatus, InventoryStatus } from '@/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function formatCurrency(cr: number): string {
  if (cr >= 100) return `₹${(cr / 100).toFixed(1)}K Cr`
  return `₹${cr.toFixed(1)} Cr`
}

export function projectStatusColor(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    on_track: 'bg-success/20 text-success border border-success/30',
    at_risk: 'bg-accent/20 text-accent border border-accent/30',
    delayed: 'bg-danger/20 text-danger border border-danger/30',
    completed: 'bg-info/20 text-info border border-info/30',
  }
  return map[status]
}

export function projectStatusLabel(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    delayed: 'Delayed',
    completed: 'Completed',
  }
  return map[status]
}

export function taskStatusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: 'bg-text-muted/20 text-text-muted border border-text-muted/30',
    in_progress: 'bg-info/20 text-info border border-info/30',
    done: 'bg-success/20 text-success border border-success/30',
    blocked: 'bg-danger/20 text-danger border border-danger/30',
  }
  return map[status]
}

export function taskStatusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
  }
  return map[status]
}

export function priorityColor(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: 'bg-text-muted/20 text-text-muted border border-text-muted/30',
    medium: 'bg-info/20 text-info border border-info/30',
    high: 'bg-accent/20 text-accent border border-accent/30',
    urgent: 'bg-danger/20 text-danger border border-danger/30',
  }
  return map[priority]
}

export function workerStatusColor(status: WorkerStatus): string {
  const map: Record<WorkerStatus, string> = {
    active: 'bg-success',
    on_break: 'bg-accent',
    absent: 'bg-danger',
  }
  return map[status]
}

export function equipmentStatusColor(status: EquipmentStatus): string {
  const map: Record<EquipmentStatus, string> = {
    operational: 'bg-success/20 text-success border border-success/30',
    in_repair: 'bg-danger/20 text-danger border border-danger/30',
    service_due: 'bg-accent/20 text-accent border border-accent/30',
  }
  return map[status]
}

export function inventoryStatusColor(status: InventoryStatus): string {
  const map: Record<InventoryStatus, string> = {
    ok: 'bg-success/20 text-success border border-success/30',
    reorder_soon: 'bg-accent/20 text-accent border border-accent/30',
    low_stock: 'bg-danger/20 text-danger border border-danger/30',
  }
  return map[status]
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
