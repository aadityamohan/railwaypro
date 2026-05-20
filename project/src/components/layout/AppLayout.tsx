import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Drawer } from './Drawer'
import { BottomNav } from './BottomNav'
import { useRealtimeData } from '@/hooks/useRealtimeData'

export function AppLayout() {
  useRealtimeData()

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <TopBar />
      <Drawer />
      <main className="pt-14 pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
