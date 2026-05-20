import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle, Download, CheckSquare, TrendingUp, Train, Users, Wallet, Clock } from 'lucide-react'
import { useCurrentUser, useProjects, useTasks, useWorkers, useAuditLogs, useStore } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AddTaskModal } from '@/components/modals/AddTask'
import { LogIncidentModal } from '@/components/modals/LogIncident'
import { projectStatusColor, projectStatusLabel, formatDate, formatCurrency } from '@/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const projects = useProjects()
  const tasks = useTasks()
  const workers = useWorkers()
  const auditLogs = useAuditLogs()

  const [showAddTask, setShowAddTask] = useState(false)
  const [showLogIncident, setShowLogIncident] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const activeProjects = projects.filter((p) => p.status !== 'completed').length
  const avgProgress = projects.length ? Math.round(projects.reduce((a, p) => a + p.progressPercent, 0) / projects.length) : 0
  const totalBudgetUsed = projects.reduce((a, p) => a + p.budgetUsedCr, 0)
  const totalBudget = projects.reduce((a, p) => a + p.budgetCr, 0)
  const budgetPct = totalBudget ? Math.round((totalBudgetUsed / totalBudget) * 100) : 0
  const onSiteWorkers = workers.filter((w) => w.status === 'active').length
  const topProjects = projects.slice(0, 3)
  const recentLogs = auditLogs.slice(0, 4)

  const greetHour = new Date().getHours()
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-surface to-surface-2 border border-surface-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-muted text-sm">{greeting},</p>
            <h1 className="text-xl font-bold text-text-primary mt-0.5">
              {currentUser?.name ?? 'Site Manager'}
            </h1>
            <p className="text-xs text-text-muted mt-1">{today}</p>
          </div>
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30">
            <Train size={22} className="text-accent" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-success/20 text-success border border-success/30">
            <span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5" />
            {activeProjects} Active Projects
          </Badge>
          <Badge className="bg-info/20 text-info border border-info/30">
            {onSiteWorkers} On Site
          </Badge>
          <Badge className="bg-accent/20 text-accent border border-accent/30">
            {avgProgress}% Avg Progress
          </Badge>
        </div>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Active Projects" value={activeProjects} icon={<TrendingUp size={16} />} color="accent" />
        <KpiCard label="Avg Progress" value={`${avgProgress}%`} icon={<CheckSquare size={16} />} color="success" />
        <KpiCard label="On Site Now" value={onSiteWorkers} sub={`of ${workers.length} total`} icon={<Users size={16} />} color="info" />
        <KpiCard label="Budget Used" value={`${budgetPct}%`} sub={formatCurrency(totalBudgetUsed)} icon={<Wallet size={16} />} color={budgetPct > 80 ? 'danger' : 'accent'} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowAddTask(true)}
            className="flex-1"
          >
            New Task
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<AlertTriangle size={14} />}
            onClick={() => setShowLogIncident(true)}
            className="flex-1"
          >
            Log Incident
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => navigate('/reports')}
            className="flex-1"
          >
            Report
          </Button>
        </div>
      </div>

      {/* Project Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Project Status</h2>
          <button onClick={() => navigate('/projects')} className="text-xs text-accent hover:text-accent/80">
            View all →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {topProjects.length === 0 && (
            <Card className="text-center text-text-muted text-sm py-6">No projects yet</Card>
          )}
          {topProjects.map((p) => (
            <Card
              key={p.id}
              hoverable
              onClick={() => navigate('/projects')}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.zone} · {p.type?.replace(/_/g, ' ')}</p>
                </div>
                <Badge className={projectStatusColor(p.status)}>{projectStatusLabel(p.status)}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1.5">
                  <span>Progress</span>
                  <span className="font-mono text-text-primary">{p.progressPercent}%</span>
                </div>
                <ProgressBar value={p.progressPercent} color={p.status === 'delayed' ? 'danger' : p.status === 'at_risk' ? 'accent' : 'success'} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Recent Activity</h2>
        <div className="flex flex-col gap-2">
          {recentLogs.length === 0 && (
            <Card className="text-center text-text-muted text-sm py-6">No activity yet</Card>
          )}
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 bg-surface rounded-xl px-4 py-3">
              <div className="w-7 h-7 bg-surface-2 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={13} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{log.details || `${log.action} ${log.entity}`}</p>
                <p className="text-xs text-text-muted mt-0.5">{log.userName} · {formatDate(log.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} />
      <LogIncidentModal open={showLogIncident} onClose={() => setShowLogIncident(false)} />
    </div>
  )
}
