import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { createWorker } from '@/lib/firestore'
import { useCurrentUser } from '@/store'
import { getInitials } from '@/utils'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddWorkerModal({ open, onClose }: Props) {
  const currentUser = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', role: '', zone: '', phone: '', status: 'active',
    hoursToday: 0, certifications: '',
  })

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.name || !form.role) {
      toast.error('Name and role are required')
      return
    }
    setLoading(true)
    try {
      await createWorker(
        {
          ...form,
          initials: getInitials(form.name),
          certifications: form.certifications.split(',').map((c) => c.trim()).filter(Boolean),
        },
        currentUser
      )
      toast.success('Worker added')
      onClose()
      setForm({ name: '', role: '', zone: '', phone: '', status: 'active', hoursToday: 0, certifications: '' })
    } catch {
      toast.error('Failed to add worker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Worker"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>Add Worker</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Full Name" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Role" placeholder="e.g. Track Foreman" value={form.role} onChange={(e) => set('role', e.target.value)} />
          <Input label="Zone" placeholder="e.g. Zone B" value={form.zone} onChange={(e) => set('zone', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="on_break">On Break</option>
            <option value="absent">Absent</option>
          </Select>
        </div>
        <Input label="Hours Today" type="number" min={0} max={24} value={form.hoursToday} onChange={(e) => set('hoursToday', Number(e.target.value))} />
        <Input label="Certifications (comma separated)" placeholder="e.g. Rail Safety, First Aid, PPE" value={form.certifications} onChange={(e) => set('certifications', e.target.value)} />
      </div>
    </Modal>
  )
}
