import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Bell, Globe, Clock, DollarSign, Shield,
  Copy, Building2, Check, ChevronRight, Train,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCurrentUser, useStore } from '@/store'
import { signOut } from '@/services/auth.service'
import { cn } from '@/utils'

const ROLE_STYLE = {
  admin:   { bg: 'bg-danger/15',   text: 'text-danger',   border: 'border-danger/25',   dot: 'bg-danger'   },
  manager: { bg: 'bg-accent/15',   text: 'text-accent',   border: 'border-accent/25',   dot: 'bg-accent'   },
  worker:  { bg: 'bg-info/15',     text: 'text-info',     border: 'border-info/25',     dot: 'bg-info'     },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted/70 px-1 mb-2">
      {children}
    </p>
  )
}

function SettingRow({
  icon,
  iconBg,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  last?: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-3 py-2.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-text-muted">{label}</p>
          <p className="text-sm font-medium text-text-primary leading-tight">{value}</p>
        </div>
        <ChevronRight size={14} className="text-text-muted/40" />
      </div>
      {!last && <div className="h-px bg-surface-2 ml-11" />}
    </>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const [copied, setCopied] = useState(false)

  const [notifications, setNotifications] = useState({
    incidents: true,
    taskAssigned: true,
    progressUpdates: false,
    reports: true,
  })

  async function handleSignOut() {
    try {
      await signOut()
      setCurrentUser(null)
      toast.success('Signed out')
      navigate('/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((n) => ({ ...n, [key]: !n[key] }))
  }

  function copyCode() {
    if (!currentUser?.companyId) return
    navigator.clipboard.writeText(currentUser.companyId)
    setCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const role = currentUser?.role ?? 'worker'
  const roleStyle = ROLE_STYLE[role]

  const notifItems = [
    { key: 'incidents'       as const, label: 'Incident Alerts',   desc: 'Critical safety events',      color: 'bg-danger'   },
    { key: 'taskAssigned'    as const, label: 'Task Assigned',      desc: 'When a task is assigned to you', color: 'bg-accent' },
    { key: 'progressUpdates' as const, label: 'Progress Updates',   desc: 'Daily project summaries',     color: 'bg-info'     },
    { key: 'reports'         as const, label: 'Weekly Reports',     desc: 'Weekly performance reports',  color: 'bg-success'  },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-up pb-6">

      {/* ── Profile Hero ── */}
      <div className="relative overflow-hidden bg-surface border-b border-surface-2">
        {/* decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-info/5 pointer-events-none" />
        <div className="relative px-5 pt-6 pb-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40 flex items-center justify-center text-2xl font-bold text-accent">
              {currentUser?.avatarInitials ?? 'U'}
            </div>
            <div className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface', roleStyle.dot)} />
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary leading-tight">{currentUser?.name ?? 'User'}</h2>
            <p className="text-xs text-text-muted mt-0.5 truncate">{currentUser?.email}</p>
            <div className="mt-2">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize', roleStyle.bg, roleStyle.text, roleStyle.border)}>
                <Shield size={9} />
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">

        {/* ── Company ── */}
        {currentUser?.companyId && (
          <div>
            <SectionLabel>Workspace</SectionLabel>
            <div className="bg-surface rounded-2xl border border-surface-2 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-info/15 border border-info/25 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-text-muted">Company</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{currentUser.companyName ?? 'Your Company'}</p>
                </div>
              </div>
              <div className="h-px bg-surface-2 mx-4" />
              {/* Invite code row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[11px] text-text-muted mb-0.5">Invite Code</p>
                  <p className="font-mono text-base font-bold text-accent tracking-[0.25em]">
                    {currentUser.companyId}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    copied
                      ? 'bg-success/15 text-success border-success/25'
                      : 'bg-surface-2 text-text-muted border-surface-2 hover:border-accent/40 hover:text-accent'
                  )}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="px-4 pb-3">
                <p className="text-[10px] text-text-muted/60">Share this code with your team to let them join your workspace.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Site Config ── */}
        <div>
          <SectionLabel>Configuration</SectionLabel>
          <div className="bg-surface rounded-2xl border border-surface-2 px-4">
            <SettingRow
              icon={<Globe size={14} className="text-info" />}
              iconBg="bg-info/10"
              label="Active Site"
              value="Mumbai–Ahmedabad HSR"
            />
            <SettingRow
              icon={<Clock size={14} className="text-accent" />}
              iconBg="bg-accent/10"
              label="Time Zone"
              value="Asia/Kolkata (IST)"
            />
            <SettingRow
              icon={<DollarSign size={14} className="text-success" />}
              iconBg="bg-success/10"
              label="Currency"
              value="INR (₹)"
              last
            />
          </div>
        </div>

        {/* ── Notifications ── */}
        <div>
          <SectionLabel>Notifications</SectionLabel>
          <div className="bg-surface rounded-2xl border border-surface-2 pl-4 pr-5">
            {notifItems.map(({ key, label, desc, color }, i) => (
              <div key={key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                      <Bell size={14} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{label}</p>
                      <p className="text-[11px] text-text-muted">{desc}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleNotification(key)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                      notifications[key] ? color : 'bg-surface-2'
                    )}
                  >
                    <span
                      className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ left: 2, transform: notifications[key] ? 'translateX(20px)' : 'translateX(0px)' }}
                    />
                  </button>
                </div>
                {i < notifItems.length - 1 && <div className="h-px bg-surface-2 ml-11" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── About ── */}
        <div>
          <SectionLabel>About</SectionLabel>
          <div className="bg-surface rounded-2xl border border-surface-2 overflow-hidden">
            {/* app brand row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-2">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                <Train size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary font-mono">RAILBUILD PRO</p>
                <p className="text-[11px] text-text-muted">Construction Management OS</p>
              </div>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {[
                { label: 'Version',  value: '1.0.0' },
                { label: 'Build',    value: 'PWA'   },
                { label: 'Platform', value: 'Web + Mobile' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">{label}</span>
                  <span className="font-mono text-xs font-medium text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>

      </div>
    </div>
  )
}
