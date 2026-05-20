import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useIncidents, useWorkers, useCurrentUser } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LogIncidentModal } from '@/components/modals/LogIncident'
import { upsertChecklistItem } from '@/lib/firestore'
import { cn } from '@/utils'

const DEFAULT_CHECKLIST = [
  { id: 'ppe', label: 'PPE inspection completed for all crew' },
  { id: 'tools', label: 'All tools accounted and serviceable' },
  { id: 'equipment_check', label: 'Equipment pre-start checks done' },
  { id: 'exclusion_zones', label: 'Exclusion zones marked and enforced' },
  { id: 'emergency_plan', label: 'Emergency response plan reviewed' },
  { id: 'communication', label: 'Radio check with all zones' },
  { id: 'weather', label: 'Weather and environmental check done' },
  { id: 'hazards', label: 'Site hazard walk-through completed' },
]

export function SafetyPage() {
  const incidents = useIncidents()
  const workers = useWorkers()
  const currentUser = useCurrentUser()
  const [showLogIncident, setShowLogIncident] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const today = new Date().toISOString().split('T')[0]

  // Calculate safe days (days since last incident)
  const safeDays = (() => {
    if (incidents.length === 0) return 30
    const last = incidents[0]
    const lastDate = new Date(last.occurredAt || last.id)
    const diff = Math.floor((Date.now() - lastDate.getTime()) / 86400000)
    return Math.max(0, diff)
  })()

  const certOverdue = workers.filter((w) => w.certifications?.length === 0).length
  const ppeCompliance = workers.length
    ? Math.round((workers.filter((w) => w.status === 'active').length / workers.length) * 100)
    : 100
  const nearMisses = incidents.filter((i) => i.type === 'near_miss').length

  async function toggleItem(itemId: string) {
    if (!currentUser) return
    const next = new Set(checkedItems)
    if (next.has(itemId)) {
      next.delete(itemId)
    } else {
      next.add(itemId)
    }
    setCheckedItems(next)
    try {
      await upsertChecklistItem(today, itemId, next.has(itemId), currentUser)
    } catch {
      toast.error('Failed to save checklist')
    }
  }

  const checkedCount = checkedItems.size
  const totalItems = DEFAULT_CHECKLIST.length

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Safety</h1>
          <p className="text-xs text-text-muted">Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
        <Button
          size="sm"
          variant="danger"
          icon={<AlertTriangle size={14} />}
          onClick={() => setShowLogIncident(true)}
        >
          Log Incident
        </Button>
      </div>

      {/* Safe Days Streak */}
      <Card className="flex flex-col items-center py-6 bg-gradient-to-br from-surface to-surface-2 border border-surface-2">
        <div className="w-20 h-20 bg-success/20 rounded-full flex flex-col items-center justify-center border-4 border-success/40 mb-3">
          <span className="font-mono font-bold text-3xl text-success">{safeDays}</span>
        </div>
        <p className="font-semibold text-text-primary">Safe Days</p>
        <p className="text-xs text-text-muted mt-1">
          {safeDays === 0 ? 'Incident logged today' : `${safeDays} days without a recordable incident`}
        </p>
        {safeDays >= 30 && (
          <Badge className="mt-3 bg-success/20 text-success border border-success/30">
            <Shield size={11} className="mr-1" />
            Safety Milestone
          </Badge>
        )}
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Safe Days" value={safeDays} color="success" />
        <KpiCard label="Cert Overdue" value={certOverdue} color={certOverdue > 0 ? 'danger' : 'default'} />
        <KpiCard label="PPE Compliance" value={`${ppeCompliance}%`} color={ppeCompliance >= 90 ? 'success' : 'accent'} />
        <KpiCard label="Near Misses" value={nearMisses} color={nearMisses > 0 ? 'accent' : 'default'} />
      </div>

      {/* Daily Safety Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Daily Safety Checklist</p>
            <p className="text-xs text-text-muted mt-0.5">{checkedCount}/{totalItems} items completed</p>
          </div>
          <Badge className={checkedCount === totalItems ? 'bg-success/20 text-success border-success/30' : 'bg-surface-2 text-text-muted border-surface-2'}>
            {checkedCount === totalItems ? '✓ Complete' : `${Math.round((checkedCount / totalItems) * 100)}%`}
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-full bg-surface-2 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 bg-success rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / totalItems) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-2">
          {DEFAULT_CHECKLIST.map((item) => {
            const checked = checkedItems.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  checked ? 'bg-success/10 border border-success/20' : 'bg-surface-2 border border-transparent hover:border-surface-2'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  checked ? 'bg-success border-success' : 'border-text-muted/40'
                )}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#0a0e17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={cn('text-sm', checked ? 'text-text-primary line-through text-text-muted' : 'text-text-primary')}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Recent Incidents */}
      {incidents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Recent Incidents</h2>
          <div className="flex flex-col gap-3">
            {incidents.slice(0, 5).map((incident) => (
              <Card key={incident.id} className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  incident.severity === 'critical' ? 'bg-danger/20' :
                  incident.severity === 'high' ? 'bg-danger/10' : 'bg-accent/10'
                )}>
                  <AlertTriangle size={15} className={
                    incident.severity === 'critical' || incident.severity === 'high' ? 'text-danger' : 'text-accent'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary capitalize">{incident.type?.replace(/_/g, ' ')}</p>
                    <Badge className={cn(
                      'text-[10px]',
                      incident.severity === 'critical' ? 'bg-danger/20 text-danger border-danger/30' :
                      incident.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                      'bg-accent/20 text-accent border-accent/30'
                    )}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{incident.zone} · Reported by {incident.reportedBy}</p>
                  {incident.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{incident.description}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <LogIncidentModal open={showLogIncident} onClose={() => setShowLogIncident(false)} />
    </div>
  )
}
