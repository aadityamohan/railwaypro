import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, BarChart3, Package, CreditCard } from 'lucide-react'
import { cn } from '@/utils'

const tabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/crew', label: 'Crew', icon: Users },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-bg/95 backdrop-blur border-t border-surface flex items-center px-2 safe-area-inset-bottom">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors',
              active ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && <span className="absolute bottom-1 w-1 h-1 bg-accent rounded-full" />}
          </button>
        )
      })}
    </nav>
  )
}
