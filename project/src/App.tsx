import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthListener } from '@/hooks/useAuthListener'
import { useAuthLoading, useCurrentUser } from '@/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { ProjectsPage } from '@/pages/Projects'
import { TasksPage } from '@/pages/Tasks'
import { CrewPage } from '@/pages/Crew'
import { EquipmentPage } from '@/pages/Equipment'
import { InventoryPage } from '@/pages/Inventory'
import { ReportsPage } from '@/pages/Reports'
import { SafetyPage } from '@/pages/Safety'
import { SettingsPage } from '@/pages/Settings'
import { PaymentsPage } from '@/pages/Payments'
import { CompanySetupPage } from '@/pages/CompanySetup'
import { Train } from 'lucide-react'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser()
  const authLoading = useAuthLoading()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30 animate-pulse">
          <Train size={28} className="text-accent" />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-text-muted text-sm font-mono">LOADING RAILBUILD PRO...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RequireCompany({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser()
  if (currentUser && !currentUser.companyId) {
    return <Navigate to="/company-setup" replace />
  }
  return <>{children}</>
}

export default function App() {
  useAuthListener()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/company-setup"
        element={
          <RequireAuth>
            <CompanySetupPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <RequireCompany>
              <AppLayout />
            </RequireCompany>
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/crew" element={<CrewPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
