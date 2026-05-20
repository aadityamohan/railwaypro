import { useState } from 'react'
import { Plus, CheckCircle, Calendar, User, Pencil } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTasks, useCurrentUser } from '@/store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/Modal'
import { AddTaskModal } from '@/components/modals/AddTask'
import { updateTask } from '@/lib/firestore'
import { taskStatusColor, taskStatusLabel, priorityColor, formatDate, cn } from '@/utils'
import type { Task, TaskStatus } from '@/types'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
]

export function TasksPage() {
  const tasks = useTasks()
  const currentUser = useCurrentUser()
  const [showAdd, setShowAdd] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>(undefined)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completing, setCompleting] = useState(false)

  const isAdmin = currentUser?.role === 'admin'
  const canAdd = !!currentUser

  async function markComplete(task: Task) {
    if (!currentUser) return
    setCompleting(true)
    try {
      await updateTask(task.id, { status: 'done' }, currentUser)
      toast.success('Task marked complete')
      setSelectedTask(null)
    } catch {
      toast.error('Failed to update task')
    } finally {
      setCompleting(false)
    }
  }

  function handleEdit(task: Task) {
    setSelectedTask(null)
    setEditTask(task)
    setShowAdd(true)
  }

  return (
    <div className="py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Tasks</h1>
          <p className="text-xs text-text-muted">{tasks.length} total tasks</p>
        </div>
        {canAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditTask(undefined); setShowAdd(true) }}>
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id} className="flex-shrink-0 w-72 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                  {col.label}
                </span>
                <Badge className={taskStatusColor(col.id)}>{colTasks.length}</Badge>
              </div>

              <div className="flex flex-col gap-3">
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-surface-2 rounded-2xl h-20 flex items-center justify-center">
                    <span className="text-xs text-text-muted/50">Empty</span>
                  </div>
                )}
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-surface rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-surface-2 active:scale-[0.98] transition-all"
                  >
                    <p className="text-sm font-medium text-text-primary leading-snug">{task.title}</p>
                    <p className="text-xs text-text-muted">{task.projectName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={priorityColor(task.priority)}>{task.priority}</Badge>
                      {task.category && (
                        <Badge className="bg-surface-2 text-text-muted border border-surface-2 text-[10px]">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {task.assigneeName || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Detail Sheet */}
      <BottomSheet
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
      >
        {selectedTask && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-text-primary flex-1">{selectedTask.title}</h2>
              {isAdmin && (
                <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => handleEdit(selectedTask)}>
                  Edit
                </Button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge className={taskStatusColor(selectedTask.status)}>{taskStatusLabel(selectedTask.status)}</Badge>
              <Badge className={priorityColor(selectedTask.priority)}>{selectedTask.priority} priority</Badge>
            </div>

            <div className="bg-surface-2 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-text-muted mb-1">Project</p>
                <p className="text-text-primary">{selectedTask.projectName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Assignee</p>
                <p className="text-text-primary">{selectedTask.assigneeName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Category</p>
                <p className="text-text-primary capitalize">{selectedTask.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Due Date</p>
                <p className="text-text-primary">{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '—'}</p>
              </div>
            </div>

            {selectedTask.notes && (
              <div className="bg-surface-2 rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Notes</p>
                <p className="text-sm text-text-primary">{selectedTask.notes}</p>
              </div>
            )}

            {selectedTask.status !== 'done' && (
              <Button
                variant="success"
                fullWidth
                icon={<CheckCircle size={16} />}
                loading={completing}
                onClick={() => markComplete(selectedTask)}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        )}
      </BottomSheet>

      <AddTaskModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditTask(undefined) }}
        existing={editTask}
      />
    </div>
  )
}
