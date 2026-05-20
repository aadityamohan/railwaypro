import { useState } from 'react'
import { Plus, Package, ArrowUpCircle, ArrowDownCircle, RefreshCw, IndianRupee, Receipt } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useInventory, useCurrentUser } from '@/store'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ImageUpload, ImageViewer } from '@/components/ui/ImageUpload'
import { createInventoryItem, updateInventoryItem } from '@/lib/firestore'
import { uploadImage, inventoryBillPath } from '@/lib/storage'
import { inventoryStatusColor, cn } from '@/utils'
import type { InventoryItem } from '@/types'

function deriveStatus(quantity: number, reorderLevel: number): InventoryItem['status'] {
  if (quantity <= reorderLevel * 0.5) return 'low_stock'
  if (quantity <= reorderLevel) return 'reorder_soon'
  return 'ok'
}

export function InventoryPage() {
  const inventory = useInventory()
  const currentUser = useCurrentUser()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'manage'>('list')

  const lowStock = inventory.filter((i) => i.status === 'low_stock').length
  const reorderSoon = inventory.filter((i) => i.status === 'reorder_soon').length
  const stockValue = inventory.reduce((a, i) => a + i.quantity, 0)
  const totalValue = inventory.reduce((a, i) => a + (i.quantity * (i.pricePerUnit ?? 0)), 0)

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Inventory</h1>
          <p className="text-xs text-text-muted">{inventory.length} items tracked</p>
        </div>
        {canEdit && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Add
          </Button>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Items" value={inventory.length} icon={<Package size={14} />} />
        <KpiCard label="Low Stock" value={lowStock} color={lowStock > 0 ? 'danger' : 'default'} />
        <KpiCard label="Reorder Soon" value={reorderSoon} color={reorderSoon > 0 ? 'accent' : 'default'} />
        <KpiCard
          label="Stock Value"
          value={totalValue > 0 ? `₹${(totalValue / 100000).toFixed(1)}L` : stockValue.toLocaleString()}
          sub={totalValue > 0 ? `${stockValue.toLocaleString()} units` : 'units'}
          icon={<IndianRupee size={14} />}
          color="accent"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl">
        {(['list', 'manage'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 text-xs font-semibold rounded-lg transition-colors capitalize',
              activeTab === tab ? 'bg-accent text-bg' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {tab === 'list' ? 'Materials List' : 'Quantity Management'}
          </button>
        ))}
      </div>

      {/* Materials List Tab */}
      {activeTab === 'list' && (
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-2.5 bg-surface-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Material</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Qty · Price</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-right w-20">Status</span>
          </div>

          {inventory.length === 0 && (
            <div className="text-center text-text-muted text-sm py-8">No inventory items yet</div>
          )}

          {inventory.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                'grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 items-center transition-colors cursor-pointer',
                i % 2 === 0 ? 'bg-surface' : 'bg-surface/50',
                'hover:bg-surface-2 active:scale-[0.99]',
                item.status === 'low_stock' && 'border-l-2 border-danger',
                item.status === 'reorder_soon' && 'border-l-2 border-accent',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.billImageUrl && (
                  <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-surface-2">
                    <img src={item.billImageUrl} alt="bill" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">{item.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-text-primary">{item.quantity.toLocaleString()} {item.unit}</p>
                {item.pricePerUnit ? (
                  <p className="text-xs text-accent font-mono">₹{item.pricePerUnit.toLocaleString()}/{item.unit}</p>
                ) : (
                  <p className="text-xs text-text-muted/50">—</p>
                )}
              </div>
              <div className="w-20 flex justify-end">
                <Badge className={cn('text-[10px]', inventoryStatusColor(item.status))}>
                  {item.status === 'ok' ? 'OK' : item.status === 'reorder_soon' ? 'Reorder' : 'Low'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Management Tab */}
      {activeTab === 'manage' && (
        <div className="flex flex-col gap-3">
          {inventory.length === 0 && (
            <Card className="text-center text-text-muted text-sm py-8">No inventory items yet</Card>
          )}
          {inventory.map((item) => (
            <QuantityCard key={item.id} item={item} canEdit={canEdit} />
          ))}
        </div>
      )}

      {/* Item detail modal (from list tap) */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          canEdit={canEdit}
        />
      )}

      {canEdit && (
        <AddInventoryModal open={showAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}

// ── Item Detail Modal ─────────────────────────────────────────────────────────

function ItemDetailModal({
  item, open, onClose, canEdit
}: { item: InventoryItem; open: boolean; onClose: () => void; canEdit: boolean }) {
  const currentUser = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [billFile, setBillFile] = useState<File | null>(null)
  const [billPreview, setBillPreview] = useState<string>('')
  const [quantity, setQuantity] = useState(item.quantity)
  const [status, setStatus] = useState(item.status)

  function onBillChange(file: File | null) {
    setBillFile(file)
    setBillPreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleSave() {
    if (!currentUser) return
    setLoading(true)
    try {
      let billImageUrl = item.billImageUrl
      if (billFile) {
        billImageUrl = await uploadImage(billFile, inventoryBillPath(item.id, billFile.name))
      }
      await updateInventoryItem(item.id, { quantity, status, billImageUrl }, currentUser)
      toast.success('Item updated')
      onClose()
    } catch {
      toast.error('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const totalVal = (item.pricePerUnit ?? 0) * quantity

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item.name}
      size="lg"
      footer={canEdit ? (
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSave}>Save Changes</Button>
        </div>
      ) : undefined}
    >
      <div className="flex flex-col gap-4">
        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-2 rounded-xl p-3">
            <p className="text-xs text-text-muted">Category</p>
            <p className="text-sm font-semibold text-text-primary mt-1">{item.category || '—'}</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-3">
            <p className="text-xs text-text-muted">Reorder Level</p>
            <p className="text-sm font-semibold text-text-primary mt-1">{item.reorderLevel} {item.unit}</p>
          </div>
          {item.pricePerUnit && (
            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-xs text-text-muted">Price / Unit</p>
              <p className="text-sm font-semibold text-accent mt-1 font-mono">₹{item.pricePerUnit.toLocaleString()}</p>
            </div>
          )}
          {item.pricePerUnit && (
            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-xs text-text-muted">Total Value</p>
              <p className="text-sm font-semibold text-accent mt-1 font-mono">₹{totalVal.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Editable fields */}
        {canEdit && (
          <>
            <Input
              label={`Quantity (${item.unit})`}
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as InventoryItem['status'])}>
              <option value="ok">OK</option>
              <option value="reorder_soon">Reorder Soon</option>
              <option value="low_stock">Low Stock</option>
            </Select>
          </>
        )}

        {/* Bill image */}
        {canEdit ? (
          <ImageUpload
            label="Bill / Invoice Image"
            value={item.billImageUrl}
            previewUrl={billPreview}
            onChange={onBillChange}
            accept="image/*,.pdf"
          />
        ) : item.billImageUrl ? (
          <ImageViewer url={item.billImageUrl} label="Bill / Invoice" />
        ) : null}
      </div>
    </Modal>
  )
}

// ── Quantity Management Card ─────────────────────────────────────────────────

function QuantityCard({ item, canEdit }: { item: InventoryItem; canEdit: boolean }) {
  const currentUser = useCurrentUser()
  const [localQty, setLocalQty] = useState(item.quantity)
  const [saving, setSaving] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustMode, setAdjustMode] = useState<'add' | 'subtract'>('add')
  const [adjustAmt, setAdjustAmt] = useState('')

  const isDirty = localQty !== item.quantity
  const stockPct = item.reorderLevel > 0
    ? Math.min(100, Math.round((localQty / (item.reorderLevel * 2)) * 100))
    : 100
  const derivedStatus = deriveStatus(localQty, item.reorderLevel)
  const step = ['kg', 't', 'm'].includes(item.unit) ? 10 : 1
  const totalVal = (item.pricePerUnit ?? 0) * localQty

  function increment() { setLocalQty((q) => q + step) }
  function decrement() { setLocalQty((q) => Math.max(0, q - step)) }

  function applyAdjust() {
    const amt = Number(adjustAmt)
    if (!amt || isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return }
    setLocalQty((q) => adjustMode === 'add' ? q + amt : Math.max(0, q - amt))
    setAdjustAmt('')
    setShowAdjust(false)
  }

  async function handleSave() {
    if (!currentUser) return
    setSaving(true)
    try {
      await updateInventoryItem(item.id, { quantity: localQty, status: derivedStatus }, currentUser)
      toast.success(`${item.name} updated`)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.billImageUrl && (
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-surface-2">
              <img src={item.billImageUrl} alt="bill" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
            <p className="text-xs text-text-muted">{item.category}</p>
          </div>
        </div>
        <Badge className={cn('text-[10px] flex-shrink-0', inventoryStatusColor(derivedStatus))}>
          {derivedStatus === 'ok' ? 'OK' : derivedStatus === 'reorder_soon' ? 'Reorder' : 'Low Stock'}
        </Badge>
      </div>

      {/* Price row */}
      {item.pricePerUnit && (
        <div className="flex items-center justify-between bg-surface-2 rounded-xl px-3 py-2">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Receipt size={11} /> ₹{item.pricePerUnit.toLocaleString()} / {item.unit}
          </span>
          <span className="text-xs font-mono font-semibold text-accent">
            Total: ₹{totalVal.toLocaleString()}
          </span>
        </div>
      )}

      {/* Stock level bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-text-muted">Stock Level</span>
          <span className="text-text-muted">Reorder at {item.reorderLevel.toLocaleString()} {item.unit}</span>
        </div>
        <ProgressBar
          value={stockPct}
          color={derivedStatus === 'low_stock' ? 'danger' : derivedStatus === 'reorder_soon' ? 'accent' : 'success'}
          size="md"
        />
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-3">
        {canEdit && (
          <button
            onClick={decrement}
            className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
          >
            <ArrowDownCircle size={18} />
          </button>
        )}
        <div className="flex-1 text-center">
          <p className="font-mono text-2xl font-bold text-text-primary">{localQty.toLocaleString()}</p>
          <p className="text-xs text-text-muted">{item.unit}</p>
        </div>
        {canEdit && (
          <button
            onClick={increment}
            className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-success hover:bg-success/10 transition-colors flex-shrink-0"
          >
            <ArrowUpCircle size={18} />
          </button>
        )}
      </div>

      {/* Bulk adjust */}
      {canEdit && (
        <>
          {showAdjust ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustMode('add')}
                  className={cn('flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                    adjustMode === 'add' ? 'bg-success/20 text-success' : 'bg-surface-2 text-text-muted')}
                >
                  + Add Stock
                </button>
                <button
                  onClick={() => setAdjustMode('subtract')}
                  className={cn('flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                    adjustMode === 'subtract' ? 'bg-danger/20 text-danger' : 'bg-surface-2 text-text-muted')}
                >
                  − Consume
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder={`Amount in ${item.unit}`}
                  value={adjustAmt}
                  onChange={(e) => setAdjustAmt(e.target.value)}
                  className="flex-1 bg-surface-2 border border-surface-2 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/60"
                />
                <Button size="sm" onClick={applyAdjust}>Apply</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAdjust(false); setAdjustAmt('') }}>✕</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdjust(true)}
              className="text-xs text-text-muted hover:text-accent transition-colors text-center py-1"
            >
              Bulk adjust quantity
            </button>
          )}
        </>
      )}

      {/* Save / Reset */}
      {canEdit && isDirty && (
        <div className="flex gap-2 pt-1 border-t border-surface-2">
          <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={() => { setLocalQty(item.quantity); setShowAdjust(false) }}>
            Reset
          </Button>
          <Button size="sm" fullWidth loading={saving} onClick={handleSave}>
            Save — {localQty.toLocaleString()} {item.unit}
          </Button>
        </div>
      )}
    </Card>
  )
}

// ── Add Inventory Modal ───────────────────────────────────────────────────────

function AddInventoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentUser = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [billFile, setBillFile] = useState<File | null>(null)
  const [billPreview, setBillPreview] = useState('')
  const [form, setForm] = useState({
    name: '', category: '', quantity: 0, unit: 'pcs',
    reorderLevel: 0, status: 'ok', pricePerUnit: 0,
  })

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function onBillChange(file: File | null) {
    setBillFile(file)
    setBillPreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!form.name) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const itemId = await createInventoryItem({ ...form }, currentUser)

      if (billFile && itemId) {
        const billImageUrl = await uploadImage(billFile, inventoryBillPath(itemId, billFile.name))
        await updateInventoryItem(itemId, { billImageUrl }, currentUser)
      }

      toast.success('Item added')
      onClose()
      setForm({ name: '', category: '', quantity: 0, unit: 'pcs', reorderLevel: 0, status: 'ok', pricePerUnit: 0 })
      setBillFile(null)
      setBillPreview('')
    } catch {
      toast.error('Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Inventory Item"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>Add Item</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Item Name" placeholder="e.g. Rail Bolts M24" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select...</option>
            <option value="Rails">Rails</option>
            <option value="Fasteners">Fasteners</option>
            <option value="Sleepers">Sleepers</option>
            <option value="Ballast">Ballast</option>
            <option value="Electrical">Electrical</option>
            <option value="Safety">Safety</option>
            <option value="Tools">Tools</option>
            <option value="Other">Other</option>
          </Select>
          <Select label="Unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
            <option value="pcs">pcs</option>
            <option value="m">m</option>
            <option value="kg">kg</option>
            <option value="t">t (tonnes)</option>
            <option value="sets">sets</option>
            <option value="rolls">rolls</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantity" type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
          <Input label="Reorder Level" type="number" min={0} value={form.reorderLevel} onChange={(e) => set('reorderLevel', Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Price per Unit (₹)" type="number" min={0} value={form.pricePerUnit} onChange={(e) => set('pricePerUnit', Number(e.target.value))} />
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="ok">OK</option>
            <option value="reorder_soon">Reorder Soon</option>
            <option value="low_stock">Low Stock</option>
          </Select>
        </div>
        <ImageUpload
          label="Bill / Invoice Image"
          previewUrl={billPreview}
          onChange={onBillChange}
          accept="image/*,.pdf"
        />
      </div>
    </Modal>
  )
}
