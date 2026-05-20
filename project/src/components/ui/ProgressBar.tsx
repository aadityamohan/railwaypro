import { cn } from '@/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  trackClassName?: string
  color?: 'accent' | 'success' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const colorClass = {
  accent: 'bg-accent',
  success: 'bg-success',
  danger: 'bg-danger',
  info: 'bg-info',
}

export function ProgressBar({ value, max = 100, className, trackClassName, color = 'accent', size = 'sm' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('w-full bg-surface-2 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5', trackClassName)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClass[color], className)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
