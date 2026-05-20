import { Menu, Bell } from 'lucide-react'
import { useStore, useCurrentUser } from '@/store'

export function TopBar() {
  const openDrawer = useStore((s) => s.openDrawer)
  const currentUser = useCurrentUser()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-bg/95 backdrop-blur border-b border-surface flex items-center px-4 gap-3">
      <button
        onClick={openDrawer}
        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <span className="font-mono font-bold text-accent text-sm tracking-wider">RAILBUILD PRO</span>
        {currentUser && (
          <span className="ml-2 text-xs text-text-muted bg-surface px-2 py-0.5 rounded-full capitalize">
            {currentUser.role}
          </span>
        )}
      </div>

      <button className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
      </button>

      {currentUser && (
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
          {currentUser.avatarInitials}
        </div>
      )}
    </header>
  )
}
