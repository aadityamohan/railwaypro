import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { createTask, updateTask } from '@/lib/firestore'
import { useCurrentUser, useProjects, useWorkers } from '@/store'
import type { Task } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Task
}

const EMPTY = {
  title: '', projectId: '', priority: 'medium', assigneeId: '',
  dueDate: '', notes: '', category: 'general',
}

export function AddTaskModal({ open, onClose, existing }: Props) {
  const currentUser = useCurrentUser()
  const projects = useProjects()
  const workers = useWorkers()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        projectId: existing.projectId,
        priority: existing.priority,
        assigneeId: existing.assigneeId ?? '',
        dueDate: existing.dueDate ?? '',
        notes: existing.notes ?? '',
        category: existing.category ?? 'general',
      })
    } else {
      setForm(EMPTY)
    }
  }, [existing, open])

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.title || !form.projectId) {
      toast.error('Title and project are required')
      return
    }
    const project = projects.find((p) => p.id === form.projectId)
    const worker = workers.find((w) => w.id === form.assigneeId)
    setLoading(true)
    try {
      if (existing) {
        await updateTask(
          existing.id,
          {
            ...form,
            projectName: project?.name ?? existing.projectName,
            assigneeName: worker?.name ?? existing.assigneeName,
          },
          currentUser
        )
        toast.success('Task updated')
      } else {
        await createTask(
          {
            ...form,
            status: 'todo',
            projectName: project?.name ?? '',
            assigneeName: worker?.name ?? '',
          },
          currentUser
        )
        toast.success('Task created')
      }
      onClose()
    } catch (err) {
      console.error('Task write error:', err)
      const code = (err as { code?: string })?.code ?? 'unknown'
      toast.error(`${existing ? 'Failed to update task' : 'Failed to create task'} [${code}]`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit Task' : 'Add New Task'}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            {existing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Task Title" placeholder="e.g. Install track section 4A" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <Select label="Project" value={form.projectId} onChange={(e) => set('projectId', e.target.value)}>
          <option value="">Select project...</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
        <Select label="Assignee" value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
          <option value="">Unassigned</option>
          {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </Select>
        <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
          <option value="general">General</option>
          <option value="track">Track Laying</option>
          <option value="civil">Civil Works</option>
          <option value="electrical">Electrical</option>
          <option value="inspection">Inspection</option>
          <option value="safety">Safety</option>
        </Select>
        <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        <Textarea label="Notes" placeholder="Additional details..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
    </Modal>
  )
}
