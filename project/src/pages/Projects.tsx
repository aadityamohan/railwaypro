import { useState } from 'react'
import { Search, Plus, Users, Calendar, ChevronRight, Pencil } from 'lucide-react'
import { useProjects, useCurrentUser } from '@/store'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BottomSheet } from '@/components/ui/Modal'
import { AddProjectModal } from '@/components/modals/AddProject'
import {
  projectStatusColor, projectStatusLabel, formatDate, formatCurrency, cn
} from '@/utils'
import type { Project, ProjectStatus } from '@/types'

const FILTERS: { id: ProjectStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'on_track', label: 'On Track' },
  { id: 'delayed', label: 'Delayed' },
  { id: 'at_risk', label: 'At Risk' },
]

export function ProjectsPage() {
  const projects = useProjects()
  const currentUser = useCurrentUser()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editProject, setEditProject] = useState<Project | undefined>(undefined)

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.zone.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const isAdmin = currentUser?.role === 'admin'

  function handleEdit(p: Project) {
    setSelectedProject(null)
    setEditProject(p)
    setShowAdd(true)
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Projects</h1>
          <p className="text-xs text-text-muted">{projects.length} total projects</p>
        </div>
        {isAdmin && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditProject(undefined); setShowAdd(true) }}>
            New
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="w-full bg-surface border border-surface-2 rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/60"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f.id
                ? 'bg-accent text-bg'
                : 'bg-surface text-text-muted hover:text-text-primary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <Card className="text-center text-text-muted text-sm py-8">
            {search ? 'No projects match your search' : 'No projects yet'}
          </Card>
        )}
        {filtered.map((p) => (
          <Card key={p.id} hoverable onClick={() => setSelectedProject(p)}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{p.zone} · {p.type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className={projectStatusColor(p.status)}>{projectStatusLabel(p.status)}</Badge>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">Progress</span>
                <span className="font-mono text-text-primary">{p.progressPercent}%</span>
              </div>
              <ProgressBar
                value={p.progressPercent}
                color={p.status === 'delayed' ? 'danger' : p.status === 'at_risk' ? 'accent' : 'success'}
                size="md"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {p.workerCount} workers
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Due {formatDate(p.targetDate)}
              </span>
              <span className="font-mono">{formatCurrency(p.budgetUsedCr)} / {formatCurrency(p.budgetCr)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Detail Sheet */}
      <BottomSheet
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name ?? ''}
      >
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            isAdmin={isAdmin}
            onEdit={() => handleEdit(selectedProject)}
          />
        )}
      </BottomSheet>

      <AddProjectModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditProject(undefined) }}
        existing={editProject}
      />
    </div>
  )
}

function ProjectDetail({ project: p, isAdmin, onEdit }: { project: Project; isAdmin: boolean; onEdit: () => void }) {
  const budgetPct = p.budgetCr ? Math.round((p.budgetUsedCr / p.budgetCr) * 100) : 0

  const milestones = [
    { label: 'Site Survey', done: p.progressPercent >= 10 },
    { label: 'Foundation Work', done: p.progressPercent >= 30 },
    { label: 'Track Laying 50%', done: p.progressPercent >= 55 },
    { label: 'Track Laying Complete', done: p.progressPercent >= 80 },
    { label: 'Testing & Commissioning', done: p.progressPercent >= 95 },
    { label: 'Project Completion', done: p.progressPercent >= 100 },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge className={projectStatusColor(p.status)}>{projectStatusLabel(p.status)}</Badge>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{p.zone}</span>
          {isAdmin && (
            <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-muted">Overall Progress</span>
          <span className="font-mono font-bold text-text-primary">{p.progressPercent}%</span>
        </div>
        <ProgressBar value={p.progressPercent} size="md" color={p.status === 'delayed' ? 'danger' : 'success'} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-xs text-text-muted">Workers</p>
          <p className="font-mono font-bold text-text-primary mt-1">{p.workerCount}</p>
        </div>
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-xs text-text-muted">Budget Used</p>
          <p className="font-mono font-bold text-text-primary mt-1">{budgetPct}%</p>
        </div>
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-xs text-text-muted">Start Date</p>
          <p className="text-sm font-medium text-text-primary mt-1">{formatDate(p.startDate)}</p>
        </div>
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-xs text-text-muted">Target Date</p>
          <p className="text-sm font-medium text-text-primary mt-1">{formatDate(p.targetDate)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted mb-2">Budget Utilisation</p>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-muted">{formatCurrency(p.budgetUsedCr)} used</span>
          <span className="text-text-muted">{formatCurrency(p.budgetCr)} total</span>
        </div>
        <ProgressBar value={budgetPct} color={budgetPct > 90 ? 'danger' : budgetPct > 75 ? 'accent' : 'success'} size="md" />
      </div>

      {/* Milestones */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Milestone Timeline</p>
        <div className="flex flex-col gap-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                m.done ? 'bg-success/20 border border-success/40' : 'bg-surface-2 border border-surface-2'
              )}>
                {m.done && <span className="w-2 h-2 bg-success rounded-full" />}
              </div>
              <span className={cn('text-sm', m.done ? 'text-text-primary' : 'text-text-muted')}>
                {m.label}
              </span>
              {m.done && <Badge className="ml-auto bg-success/20 text-success border-success/30 text-[10px]">Done</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
