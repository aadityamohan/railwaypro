import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { updateDoc } from 'firebase/firestore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { createEquipment, cDocRef, SUB } from '@/lib/firestore'
import { uploadImage, equipmentImagePath } from '@/lib/storage'
import { useCurrentUser } from '@/store'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddEquipmentModal({ open, onClose }: Props) {
  const currentUser = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [form, setForm] = useState({
    name: '', type: '', zone: '', status: 'operational',
    hoursToday: 0, lastServiceDate: '', nextServiceDate: '',
  })

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function onImageChange(file: File | null) {
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.name || !form.type) {
      toast.error('Name and type are required')
      return
    }
    setLoading(true)
    try {
      const equipmentId = await createEquipment(form, currentUser)
      if (imageFile && equipmentId) {
        const imageUrl = await uploadImage(imageFile, equipmentImagePath(equipmentId, imageFile.name))
        await updateDoc(cDocRef(currentUser.companyId!, SUB.EQUIPMENT, equipmentId), { imageUrl })
      }
      toast.success('Equipment added')
      onClose()
      setForm({ name: '', type: '', zone: '', status: 'operational', hoursToday: 0, lastServiceDate: '', nextServiceDate: '' })
      setImageFile(null)
      setImagePreview('')
    } catch {
      toast.error('Failed to add equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Equipment"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>Add Equipment</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ImageUpload
          label="Vehicle / Equipment Photo"
          previewUrl={imagePreview}
          onChange={onImageChange}
        />
        <Input label="Equipment Name" placeholder="e.g. Track Laying Machine TLM-01" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="">Select type...</option>
            <option value="Track Layer">Track Layer</option>
            <option value="Excavator">Excavator</option>
            <option value="Crane">Crane</option>
            <option value="Concrete Mixer">Concrete Mixer</option>
            <option value="Tamping Machine">Tamping Machine</option>
            <option value="Rail Grinder">Rail Grinder</option>
            <option value="Generator">Generator</option>
            <option value="Other">Other</option>
          </Select>
          <Input label="Zone" placeholder="Zone A" value={form.zone} onChange={(e) => set('zone', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="operational">Operational</option>
            <option value="in_repair">In Repair</option>
            <option value="service_due">Service Due</option>
          </Select>
          <Input label="Hours Today" type="number" min={0} max={24} value={form.hoursToday} onChange={(e) => set('hoursToday', Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Last Service" type="date" value={form.lastServiceDate} onChange={(e) => set('lastServiceDate', e.target.value)} />
          <Input label="Next Service" type="date" value={form.nextServiceDate} onChange={(e) => set('nextServiceDate', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
