import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { createIncident } from '@/lib/firestore'
import { useCurrentUser, useProjects } from '@/store'

interface Props {
  open: boolean
  onClose: () => void
}

export function LogIncidentModal({ open, onClose }: Props) {
  const currentUser = useCurrentUser()
  const projects = useProjects()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'near_miss', severity: 'medium', zone: '',
    projectId: '', description: '', occurredAt: '',
  })

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.description || !form.zone) {
      toast.error('Description and zone are required')
      return
    }
    setLoading(true)
    try {
      await createIncident(
        { ...form, reportedBy: currentUser.name },
        currentUser
      )
      toast.success('Incident logged')
      onClose()
      setForm({ type: 'near_miss', severity: 'medium', zone: '', projectId: '', description: '', occurredAt: '' })
    } catch {
      toast.error('Failed to log incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Incident"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="danger" fullWidth loading={loading} onClick={handleSubmit}>Log Incident</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="near_miss">Near Miss</option>
            <option value="injury">Injury</option>
            <option value="equipment_damage">Equipment Damage</option>
            <option value="environmental">Environmental</option>
            <option value="fire">Fire</option>
            <option value="other">Other</option>
          </Select>
          <Select label="Severity" value={form.severity} onChange={(e) => set('severity', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Zone" placeholder="e.g. Zone C" value={form.zone} onChange={(e) => set('zone', e.target.value)} />
          <Select label="Project" value={form.projectId} onChange={(e) => set('projectId', e.target.value)}>
            <option value="">Select project...</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <Input label="Occurred At" type="datetime-local" value={form.occurredAt} onChange={(e) => set('occurredAt', e.target.value)} />
        <Textarea label="Description" placeholder="Describe what happened..." rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
    </Modal>
  )
}
