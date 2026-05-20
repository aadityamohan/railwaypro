import { cn } from '@/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-2xl p-4',
        hoverable && 'cursor-pointer transition-all duration-200 hover:bg-surface-2 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  )
}
