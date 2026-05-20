import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { createProject, updateProject } from '@/lib/firestore'
import { useCurrentUser } from '@/store'
import type { Project } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Project
}

const EMPTY = {
  name: '', zone: '', type: 'track_laying', status: 'on_track',
  progressPercent: 0, budgetCr: 0, budgetUsedCr: 0,
  workerCount: 0, startDate: '', targetDate: '',
}

export function AddProjectModal({ open, onClose, existing }: Props) {
  const currentUser = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        zone: existing.zone,
        type: existing.type,
        status: existing.status,
        progressPercent: existing.progressPercent,
        budgetCr: existing.budgetCr,
        budgetUsedCr: existing.budgetUsedCr,
        workerCount: existing.workerCount,
        startDate: existing.startDate ?? '',
        targetDate: existing.targetDate ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [existing, open])

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.name || !form.zone) {
      toast.error('Name and zone are required')
      return
    }
    setLoading(true)
    try {
      if (existing) {
        await updateProject(existing.id, form, currentUser)
        toast.success('Project updated')
      } else {
        await createProject(form, currentUser)
        toast.success('Project created')
      }
      onClose()
    } catch (err) {
      console.error('Project write error:', err)
      const code = (err as { code?: string })?.code ?? 'unknown'
      toast.error(`${existing ? 'Failed to update project' : 'Failed to create project'} [${code}]`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit Project' : 'Add New Project'}
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            {existing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Project Name" placeholder="e.g. Mumbai-Ahmedabad HSR Phase 2" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Zone" placeholder="e.g. Zone A" value={form.zone} onChange={(e) => set('zone', e.target.value)} />
          <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="track_laying">Track Laying</option>
            <option value="bridgework">Bridgework</option>
            <option value="tunneling">Tunneling</option>
            <option value="electrical">Electrical</option>
            <option value="signaling">Signaling</option>
            <option value="civil">Civil Works</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </Select>
          <Input label="Progress %" type="number" min={0} max={100} value={form.progressPercent} onChange={(e) => set('progressPercent', Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Budget (₹ Cr)" type="number" min={0} value={form.budgetCr} onChange={(e) => set('budgetCr', Number(e.target.value))} />
          <Input label="Budget Used (₹ Cr)" type="number" min={0} value={form.budgetUsedCr} onChange={(e) => set('budgetUsedCr', Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Worker Count" type="number" min={0} value={form.workerCount} onChange={(e) => set('workerCount', Number(e.target.value))} />
          <div />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          <Input label="Target Date" type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
