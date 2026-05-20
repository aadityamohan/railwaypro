import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, Wrench,
  Package, BarChart3, Shield, Settings, LogOut, X, Train, CreditCard
} from 'lucide-react'
import { useStore, useCurrentUser, useUI } from '@/store'
import { signOut } from '@/services/auth.service'
import { cn } from '@/utils'

const navGroups = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Field',
    items: [
      { path: '/projects', label: 'Projects', icon: FolderKanban },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/crew', label: 'Crew', icon: Users },
      { path: '/equipment', label: 'Equipment', icon: Wrench },
      { path: '/inventory', label: 'Inventory', icon: Package },
      { path: '/payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/reports', label: 'Reports', icon: BarChart3 },
      { path: '/safety', label: 'Safety', icon: Shield },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Drawer() {
  const { drawerOpen } = useUI()
  const closeDrawer = useStore((s) => s.closeDrawer)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    setCurrentUser(null)
    closeDrawer()
    navigate('/login')
  }

  function handleNav(path: string) {
    navigate(path)
    closeDrawer()
  }

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface flex flex-col transition-transform duration-300',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-2">
          <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center">
            <Train size={18} className="text-accent" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-text-primary">RAILBUILD PRO</div>
            <div className="text-xs text-text-muted">Construction OS</div>
          </div>
          <button
            onClick={closeDrawer}
            className="ml-auto p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-2">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
              {currentUser.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">{currentUser.name}</div>
              <div className="text-xs text-text-muted capitalize">{currentUser.role}{currentUser.companyName ? ` · ${currentUser.companyName}` : ''}</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
                {group.label}
              </div>
              {group.items.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => handleNav(path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                    location.pathname === path
                      ? 'text-accent bg-accent/10 border-r-2 border-accent'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                  )}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-surface-2 p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
