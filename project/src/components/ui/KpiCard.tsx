import { cn } from '@/utils'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  color?: 'accent' | 'success' | 'danger' | 'info' | 'default'
  className?: string
}

const colorMap = {
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
  info: 'text-info',
  default: 'text-text-primary',
}

export function KpiCard({ label, value, sub, icon, color = 'default', className }: KpiCardProps) {
  return (
    <div className={cn('bg-surface rounded-2xl p-4 flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <span className={cn('font-mono text-2xl font-bold', colorMap[color])}>{value}</span>
      {sub && <span className="text-xs text-text-muted">{sub}</span>}
    </div>
  )
}
