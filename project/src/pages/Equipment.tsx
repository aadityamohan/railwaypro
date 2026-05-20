import { useState } from 'react'
import { Plus, Wrench, Zap } from 'lucide-react'
import { useEquipment, useCurrentUser } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AddEquipmentModal } from '@/components/modals/AddEquipment'
import { equipmentStatusColor, formatDate, cn } from '@/utils'

const MAX_HOURS = 16

const equipmentTypeIcon: Record<string, string> = {
  'Track Layer': '🚂',
  'Excavator': '🏗️',
  'Crane': '🏗️',
  'Concrete Mixer': '🔄',
  'Tamping Machine': '⚙️',
  'Rail Grinder': '⚙️',
  'Generator': '⚡',
  'Other': '🔧',
}

export function EquipmentPage() {
  const equipment = useEquipment()
  const currentUser = useCurrentUser()
  const [showAdd, setShowAdd] = useState(false)

  const operational = equipment.filter((e) => e.status === 'operational').length
  const inRepair = equipment.filter((e) => e.status === 'in_repair').length
  const serviceDue = equipment.filter((e) => e.status === 'service_due').length
  const totalHours = equipment.reduce((a, e) => a + (e.hoursToday ?? 0), 0)
  const maxPossibleHours = equipment.length * MAX_HOURS
  const utilisationPct = maxPossibleHours ? Math.round((totalHours / maxPossibleHours) * 100) : 0

  const canAdd = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Equipment</h1>
          <p className="text-xs text-text-muted">{equipment.length} total units</p>
        </div>
        {canAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Add
          </Button>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Operational" value={operational} color="success" icon={<Zap size={14} />} />
        <KpiCard label="In Repair" value={inRepair} color={inRepair > 0 ? 'danger' : 'default'} icon={<Wrench size={14} />} />
        <KpiCard label="Service Due" value={serviceDue} color={serviceDue > 0 ? 'accent' : 'default'} />
        <KpiCard label="Utilisation" value={`${utilisationPct}%`} color="info" />
      </div>

      {/* Equipment List */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">All Equipment</h2>
        <div className="flex flex-col gap-3">
          {equipment.length === 0 && (
            <Card className="text-center text-text-muted text-sm py-8">No equipment added yet</Card>
          )}
          {equipment.map((eq) => {
            const utilPct = Math.round((eq.hoursToday / MAX_HOURS) * 100)
            return (
              <Card key={eq.id} className="flex flex-col gap-3">
                {/* Vehicle image banner */}
                {eq.imageUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden -mt-1 border border-surface-2">
                    <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!eq.imageUrl && (
                    <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {equipmentTypeIcon[eq.type] ?? '🔧'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{eq.name}</p>
                    <p className="text-xs text-text-muted">{eq.type} · {eq.zone}</p>
                  </div>
                  <Badge className={cn('flex-shrink-0', equipmentStatusColor(eq.status))}>
                    {eq.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Utilisation bar */}
                <div>
                  <div className="flex justify-between text-xs text-text-muted mb-1.5">
                    <span>Utilisation today</span>
                    <span className="font-mono text-text-primary">{eq.hoursToday}h / {MAX_HOURS}h</span>
                  </div>
                  <ProgressBar
                    value={utilPct}
                    color={utilPct > 90 ? 'danger' : utilPct > 70 ? 'accent' : 'success'}
                  />
                </div>

                <div className="flex justify-between text-xs text-text-muted">
                  <span>Last service: {eq.lastServiceDate ? formatDate(eq.lastServiceDate) : '—'}</span>
                  <span>Next: {eq.nextServiceDate ? formatDate(eq.nextServiceDate) : '—'}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <AddEquipmentModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
