import { useState } from 'react'
import { Plus, Phone, Award } from 'lucide-react'
import { useWorkers, useCurrentUser } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AddWorkerModal } from '@/components/modals/AddWorker'
import { workerStatusColor, cn } from '@/utils'

export function CrewPage() {
  const workers = useWorkers()
  const currentUser = useCurrentUser()
  const [showAdd, setShowAdd] = useState(false)

  const onSite = workers.filter((w) => w.status === 'active').length
  const absent = workers.filter((w) => w.status === 'absent').length
  const certified = workers.filter((w) => w.certifications?.length > 0).length
  const alerts = workers.filter((w) => w.status === 'absent').length

  const canAdd = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const MAX_HOURS = 10

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Crew & Workers</h1>
          <p className="text-xs text-text-muted">{workers.length} total crew</p>
        </div>
        {canAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Add
          </Button>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="On Site" value={onSite} color="success" />
        <KpiCard label="Absent" value={absent} color={absent > 0 ? 'danger' : 'default'} />
        <KpiCard label="Certified" value={certified} color="info" />
        <KpiCard label="Alerts" value={alerts} color={alerts > 0 ? 'danger' : 'default'} />
      </div>

      {/* Worker List */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
          All Workers
        </h2>
        <div className="flex flex-col gap-3">
          {workers.length === 0 && (
            <Card className="text-center text-text-muted text-sm py-8">No workers added yet</Card>
          )}
          {workers.map((w) => (
            <Card key={w.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-sm text-text-primary">
                    {w.initials}
                  </div>
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface',
                    workerStatusColor(w.status)
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{w.name}</p>
                  <p className="text-xs text-text-muted">{w.role} · {w.zone}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-text-primary">{w.hoursToday}h</p>
                  <p className="text-xs text-text-muted">today</p>
                </div>
              </div>

              {/* Hours bar */}
              <ProgressBar
                value={w.hoursToday}
                max={MAX_HOURS}
                color={w.hoursToday >= MAX_HOURS ? 'danger' : w.hoursToday > 7 ? 'accent' : 'success'}
              />

              {/* Bottom row */}
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Phone size={11} />
                  {w.phone || '—'}
                </span>
                <Badge className={cn(
                  'text-[10px]',
                  w.status === 'active' ? 'bg-success/20 text-success border border-success/30' :
                  w.status === 'on_break' ? 'bg-accent/20 text-accent border border-accent/30' :
                  'bg-danger/20 text-danger border border-danger/30'
                )}>
                  {w.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {workers.some((w) => w.certifications?.length > 0) && (
        <div>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
            Certifications
          </h2>
          <div className="flex flex-col gap-2">
            {workers.filter((w) => w.certifications?.length > 0).map((w) => (
              <Card key={w.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-text-primary flex-shrink-0">
                  {w.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary mb-2">{w.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {w.certifications.map((cert, i) => (
                      <Badge key={i} className="bg-info/20 text-info border border-info/30 text-[10px]">
                        <Award size={9} className="mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AddWorkerModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
