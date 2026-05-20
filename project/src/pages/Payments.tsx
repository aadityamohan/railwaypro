import { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  CreditCard,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useProjects, useRetailers, useCurrentUser } from '@/store'
import { createRetailer, recordPayment, deleteRetailer } from '@/lib/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils'
import type { Retailer, PaymentEntry } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

function amountPaid(r: Retailer) {
  return (r.payments ?? []).reduce((s, p) => s + p.amount, 0)
}

function balance(r: Retailer) {
  return r.totalDue - amountPaid(r)
}

function payStatus(r: Retailer): 'paid' | 'partial' | 'pending' {
  const bal = balance(r)
  if (bal <= 0) return 'paid'
  if (amountPaid(r) > 0) return 'partial'
  return 'pending'
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function fmtDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_STYLES = {
  paid: { label: 'Paid', icon: CheckCircle2, cls: 'text-success bg-success/10 border-success/20' },
  partial: { label: 'Partial', icon: Clock, cls: 'text-accent bg-accent/10 border-accent/20' },
  pending: { label: 'Pending', icon: AlertCircle, cls: 'text-danger bg-danger/10 border-danger/20' },
}

const CATEGORIES = ['Materials', 'Fuel', 'Labour', 'Equipment Rental', 'Services', 'Transport', 'Other']

// ─── Add Retailer Modal ──────────────────────────────────────────────────────

interface AddRetailerModalProps {
  projectId: string
  projectName: string
  onClose: () => void
}

function AddRetailerModal({ projectId, projectName, onClose }: AddRetailerModalProps) {
  const currentUser = useCurrentUser()
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [totalDue, setTotalDue] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || !totalDue) {
      toast.error('Enter retailer name and amount due')
      return
    }
    const due = parseFloat(totalDue)
    if (isNaN(due) || due <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSaving(true)
    try {
      await createRetailer({ projectId, projectName, name: name.trim(), category, totalDue: due }, currentUser!)
      toast.success('Retailer added')
      onClose()
    } catch {
      toast.error('Failed to add retailer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-surface rounded-t-3xl p-6 pb-10 flex flex-col gap-4 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-surface-2 rounded-full mx-auto mb-1" />
        <h2 className="text-lg font-semibold text-text-primary">Add Retailer</h2>
        <p className="text-xs text-text-muted -mt-2">Project: {projectName}</p>

        <Input
          label="Retailer / Supplier Name"
          placeholder="e.g. Kumar Steel Traders"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  category === c
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-surface-2 text-text-muted border-surface-2 hover:text-text-primary'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Total Amount Due (₹)"
          type="number"
          placeholder="0"
          value={totalDue}
          onChange={(e) => setTotalDue(e.target.value)}
          icon={<IndianRupee size={16} />}
        />

        <div className="flex gap-3 mt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={handleSave}>Add Retailer</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Record Payment Modal ────────────────────────────────────────────────────

interface RecordPaymentModalProps {
  retailer: Retailer
  onClose: () => void
}

function RecordPaymentModal({ retailer, onClose }: RecordPaymentModalProps) {
  const currentUser = useCurrentUser()
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const bal = balance(retailer)

  async function handleSave() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid payment amount')
      return
    }
    if (!date) {
      toast.error('Select payment date')
      return
    }
    setSaving(true)
    try {
      const newEntry: PaymentEntry = { amount: amt, date, note: note.trim() || undefined }
      const updated = [...(retailer.payments ?? []), newEntry]
      await recordPayment(retailer.id, updated, currentUser!)
      toast.success(`${fmt(amt)} recorded`)
      onClose()
    } catch {
      toast.error('Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-surface rounded-t-3xl p-6 pb-10 flex flex-col gap-4 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-surface-2 rounded-full mx-auto mb-1" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Record Payment</h2>
          <p className="text-xs text-text-muted mt-0.5">{retailer.name} · Balance {fmt(Math.max(bal, 0))}</p>
        </div>

        <Input
          label="Amount Paid (₹)"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={<IndianRupee size={16} />}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Payment Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface-2 border border-surface-2 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50"
          />
        </div>

        <Input
          label="Note (optional)"
          placeholder="e.g. Cheque #1023, NEFT..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3 mt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="success" fullWidth loading={saving} onClick={handleSave}>Record Payment</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Retailer Card ───────────────────────────────────────────────────────────

interface RetailerCardProps {
  retailer: Retailer
  canWrite: boolean
  isAdmin: boolean
}

function RetailerCard({ retailer, canWrite, isAdmin }: RetailerCardProps) {
  const currentUser = useCurrentUser()
  const [expanded, setExpanded] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const paid = amountPaid(retailer)
  const bal = balance(retailer)
  const status = payStatus(retailer)
  const { label, icon: StatusIcon, cls } = STATUS_STYLES[status]
  const progress = retailer.totalDue > 0 ? Math.min((paid / retailer.totalDue) * 100, 100) : 0
  const payments = (retailer.payments ?? []).slice().sort((a, b) => b.date.localeCompare(a.date))

  async function handleDelete() {
    if (!confirm(`Delete ${retailer.name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteRetailer(retailer.id, currentUser!)
      toast.success('Retailer deleted')
    } catch {
      toast.error('Delete failed')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-surface rounded-2xl overflow-hidden border border-surface-2">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary truncate">{retailer.name}</span>
                <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 flex-shrink-0', cls)}>
                  <StatusIcon size={10} />
                  {label}
                </span>
              </div>
              <span className="text-[11px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-md">{retailer.category}</span>
            </div>
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-text-muted hover:text-danger transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Amount rows */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col items-center bg-surface-2 rounded-xl p-2.5">
              <span className="text-[10px] text-text-muted mb-1">Total Due</span>
              <span className="text-sm font-bold font-mono text-text-primary">{fmt(retailer.totalDue)}</span>
            </div>
            <div className="flex flex-col items-center bg-success/10 rounded-xl p-2.5">
              <span className="text-[10px] text-success/80 mb-1">Paid</span>
              <span className="text-sm font-bold font-mono text-success">{fmt(paid)}</span>
            </div>
            <div className="flex flex-col items-center bg-danger/10 rounded-xl p-2.5">
              <span className="text-[10px] text-danger/80 mb-1">Balance</span>
              <span className="text-sm font-bold font-mono text-danger">{fmt(Math.max(bal, 0))}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {canWrite && bal > 0 && (
              <Button size="sm" variant="success" icon={<Plus size={14} />} onClick={() => setPayModal(true)}>
                Record Payment
              </Button>
            )}
            {payments.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                {payments.length} payment{payments.length !== 1 ? 's' : ''}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Payment history */}
        {expanded && payments.length > 0 && (
          <div className="border-t border-surface-2 px-4 py-3 flex flex-col gap-2">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-1">Payment History</p>
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-surface-2 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-success/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IndianRupee size={13} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-mono text-success">{fmt(p.amount)}</p>
                    {p.note && <p className="text-[11px] text-text-muted">{p.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <CalendarDays size={11} />
                  {fmtDate(p.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {payModal && <RecordPaymentModal retailer={retailer} onClose={() => setPayModal(false)} />}
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function PaymentsPage() {
  const currentUser = useCurrentUser()
  const projects = useProjects()
  const retailers = useRetailers()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [addModal, setAddModal] = useState(false)

  const isAdmin = currentUser?.role === 'admin'
  const canWrite = isAdmin || currentUser?.role === 'manager'

  // Default to first project
  const activeProjectId = selectedProjectId || projects[0]?.id || ''
  const activeProject = projects.find((p) => p.id === activeProjectId)

  const projectRetailers = retailers.filter((r) => r.projectId === activeProjectId)

  // Summary KPIs
  const totalDue = projectRetailers.reduce((s, r) => s + r.totalDue, 0)
  const totalPaid = projectRetailers.reduce((s, r) => s + amountPaid(r), 0)
  const totalBalance = totalDue - totalPaid

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/20 rounded-xl flex items-center justify-center">
            <CreditCard size={16} className="text-accent" />
          </div>
          <h1 className="text-lg font-bold text-text-primary">Payments</h1>
        </div>
        {canWrite && activeProject && (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddModal(true)}>
            Add Retailer
          </Button>
        )}
      </div>

      {/* Project selector */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                (activeProjectId === p.id)
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-surface text-text-muted border-surface-2 hover:text-text-primary'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      {activeProject && (
        <div className="px-4 mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-text-muted mb-1">Total Due</span>
              <span className="text-sm font-bold font-mono text-text-primary">{fmt(totalDue)}</span>
            </div>
            <div className="bg-success/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-success/70 mb-1">Total Paid</span>
              <span className="text-sm font-bold font-mono text-success">{fmt(totalPaid)}</span>
            </div>
            <div className="bg-danger/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-danger/70 mb-1">Outstanding</span>
              <span className="text-sm font-bold font-mono text-danger">{fmt(Math.max(totalBalance, 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Retailer cards */}
      <div className="flex-1 px-4 flex flex-col gap-3 pb-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CreditCard size={36} className="text-text-muted/40" />
            <p className="text-text-muted text-sm">No projects found</p>
          </div>
        ) : projectRetailers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CreditCard size={36} className="text-text-muted/40" />
            <p className="text-text-muted text-sm">No retailers for this project</p>
            {canWrite && (
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddModal(true)}>
                Add Retailer
              </Button>
            )}
          </div>
        ) : (
          projectRetailers.map((r) => (
            <RetailerCard key={r.id} retailer={r} canWrite={canWrite} isAdmin={isAdmin} />
          ))
        )}
      </div>

      {addModal && activeProject && (
        <AddRetailerModal
          projectId={activeProject.id}
          projectName={activeProject.name}
          onClose={() => setAddModal(false)}
        />
      )}
    </div>
  )
}
