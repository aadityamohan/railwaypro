import { useProjects, useWorkers, useIncidents } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Download, Mail } from 'lucide-react'
import { formatCurrency } from '@/utils'
import { toast } from 'react-hot-toast'

export function ReportsPage() {
  const projects = useProjects()
  const workers = useWorkers()
  const incidents = useIncidents()

  const avgProgress = projects.length
    ? Math.round(projects.reduce((a, p) => a + p.progressPercent, 0) / projects.length)
    : 0
  const totalBudget = projects.reduce((a, p) => a + p.budgetCr, 0)
  const totalBudgetUsed = projects.reduce((a, p) => a + p.budgetUsedCr, 0)
  const budgetPct = totalBudget ? Math.round((totalBudgetUsed / totalBudget) * 100) : 0
  const onSite = workers.filter((w) => w.status === 'active').length
  const attendancePct = workers.length ? Math.round((onSite / workers.length) * 100) : 0

  // Zone breakdown (derived from projects)
  const zoneMap: Record<string, number> = {}
  projects.forEach((p) => {
    zoneMap[p.zone] = (zoneMap[p.zone] ?? 0) + p.progressPercent
  })
  const zones = Object.entries(zoneMap).map(([zone, total]) => ({
    zone,
    avg: Math.round(total / projects.filter((p) => p.zone === zone).length),
  }))

  const milestones = [
    { label: 'Phase 1 Survey', status: 'done' },
    { label: 'Foundation Complete', status: 'done' },
    { label: 'Track Laying 50%', status: avgProgress >= 55 ? 'done' : avgProgress >= 30 ? 'active' : 'pending' },
    { label: 'Track Laying 100%', status: avgProgress >= 85 ? 'done' : avgProgress >= 55 ? 'active' : 'pending' },
    { label: 'Electrical & Signaling', status: avgProgress >= 90 ? 'active' : 'pending' },
    { label: 'Commissioning', status: avgProgress >= 100 ? 'done' : 'pending' },
  ]

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Reports & Analytics</h1>
          <p className="text-xs text-text-muted">Site-wide performance overview</p>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={() => toast.success('PDF export started (demo)')}
          className="flex-1"
        >
          Export PDF
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Mail size={14} />}
          onClick={() => toast.success('Report emailed to stakeholders (demo)')}
          className="flex-1"
        >
          Email Report
        </Button>
      </div>

      {/* Donut Chart */}
      <Card className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest self-start">Overall Completion</p>
        <DonutChart value={avgProgress} />
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div>
            <p className="font-mono text-lg font-bold text-success">{projects.filter((p) => p.status === 'completed').length}</p>
            <p className="text-xs text-text-muted">Completed</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-accent">{projects.filter((p) => p.status === 'on_track').length}</p>
            <p className="text-xs text-text-muted">On Track</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-danger">{projects.filter((p) => p.status === 'delayed').length}</p>
            <p className="text-xs text-text-muted">Delayed</p>
          </div>
        </div>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Avg Progress" value={`${avgProgress}%`} color="success" />
        <KpiCard label="Budget Used" value={`${budgetPct}%`} sub={formatCurrency(totalBudgetUsed)} color={budgetPct > 80 ? 'danger' : 'accent'} />
        <KpiCard label="Incidents" value={incidents.length} color={incidents.length > 0 ? 'danger' : 'default'} />
        <KpiCard label="Attendance" value={`${attendancePct}%`} color={attendancePct > 80 ? 'success' : 'accent'} />
      </div>

      {/* Output by Zone */}
      {zones.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Progress by Zone</p>
          <div className="flex flex-col gap-3">
            {zones.map(({ zone, avg }) => (
              <div key={zone}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-primary font-medium">{zone}</span>
                  <span className="font-mono text-text-muted">{avg}%</span>
                </div>
                <ProgressBar value={avg} color={avg >= 80 ? 'success' : avg >= 50 ? 'accent' : 'danger'} size="md" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget by Project */}
      {projects.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Budget Utilisation</p>
          <div className="flex flex-col gap-3">
            {projects.map((p) => {
              const pct = p.budgetCr ? Math.round((p.budgetUsedCr / p.budgetCr) * 100) : 0
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-primary font-medium truncate mr-2">{p.name}</span>
                    <span className="font-mono text-text-muted flex-shrink-0">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={pct > 90 ? 'danger' : pct > 75 ? 'accent' : 'success'} size="md" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Milestone Timeline */}
      <Card>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Milestone Timeline</p>
        <div className="flex flex-col gap-3">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                m.status === 'done' ? 'bg-success' : m.status === 'active' ? 'bg-accent' : 'bg-surface-2 border border-surface-2'
              }`} />
              <div className="w-px h-4 bg-surface-2 absolute ml-1.5 mt-4" />
              <span className={`text-sm ${m.status === 'done' ? 'text-text-primary' : m.status === 'active' ? 'text-accent' : 'text-text-muted'}`}>
                {m.label}
              </span>
              <span className={`ml-auto text-xs ${
                m.status === 'done' ? 'text-success' : m.status === 'active' ? 'text-accent' : 'text-text-muted/50'
              }`}>
                {m.status === 'done' ? '✓' : m.status === 'active' ? '⟳' : '○'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function DonutChart({ value }: { value: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e2840" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#2dd4a0"
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-2xl text-text-primary">{value}%</span>
        <span className="text-xs text-text-muted">Complete</span>
      </div>
    </div>
  )
}
