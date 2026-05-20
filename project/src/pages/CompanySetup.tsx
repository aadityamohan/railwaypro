import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Train, Building2, Users } from 'lucide-react'
import { createCompany, joinCompany } from '@/lib/firestore'
import { useStore, useCurrentUser } from '@/store'
import { fetchUserDoc } from '@/services/auth.service'
import { auth } from '@/lib/firebase'

type Mode = 'choose' | 'create' | 'join'

export function CompanySetupPage() {
  const currentUser = useCurrentUser()
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('choose')
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  async function handleCreate() {
    if (!currentUser) return
    if (!companyName.trim()) { toast.error('Company name is required'); return }
    setLoading(true)
    try {
      await createCompany(companyName.trim(), currentUser)
      // Refresh user doc so companyId/role are current
      const fresh = await fetchUserDoc(auth.currentUser!)
      setCurrentUser(fresh)
      toast.success('Company created!')
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!currentUser) return
    if (!inviteCode.trim()) { toast.error('Invite code is required'); return }
    setLoading(true)
    try {
      const { name } = await joinCompany(inviteCode.trim(), currentUser)
      const fresh = await fetchUserDoc(auth.currentUser!)
      setCurrentUser(fresh)
      toast.success(`Joined ${name}!`)
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error((err as Error).message || 'Failed to join company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
            <Train size={20} className="text-accent" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-text-primary">RAILBUILD PRO</div>
            <div className="text-xs text-text-muted">Construction OS</div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-2 p-6">
          {mode === 'choose' && (
            <>
              <h1 className="text-xl font-bold text-text-primary mb-1">Set up your workspace</h1>
              <p className="text-sm text-text-muted mb-6">Create a new company or join an existing one with an invite code.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode('create')}
                  className="flex items-center gap-4 p-4 rounded-xl border border-surface-2 hover:border-accent/40 hover:bg-accent/5 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">Create a company</div>
                    <div className="text-xs text-text-muted mt-0.5">Start fresh and invite your team</div>
                  </div>
                </button>
                <button
                  onClick={() => setMode('join')}
                  className="flex items-center gap-4 p-4 rounded-xl border border-surface-2 hover:border-info/40 hover:bg-info/5 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center shrink-0">
                    <Users size={20} className="text-info" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">Join a company</div>
                    <div className="text-xs text-text-muted mt-0.5">Enter an invite code from your admin</div>
                  </div>
                </button>
              </div>
            </>
          )}

          {mode === 'create' && (
            <>
              <button onClick={() => setMode('choose')} className="text-xs text-text-muted hover:text-text-primary mb-4 flex items-center gap-1">← Back</button>
              <h1 className="text-xl font-bold text-text-primary mb-1">Create Company</h1>
              <p className="text-sm text-text-muted mb-6">A 6-character invite code will be generated for your company.</p>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Company Name</label>
              <input
                type="text"
                className="w-full bg-bg border border-surface-2 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/60 mb-4"
                placeholder="e.g. Mumbai Rail Contractors Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-accent text-bg font-bold py-2.5 rounded-xl text-sm hover:bg-accent/90 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Creating…' : 'Create Company'}
              </button>
            </>
          )}

          {mode === 'join' && (
            <>
              <button onClick={() => setMode('choose')} className="text-xs text-text-muted hover:text-text-primary mb-4 flex items-center gap-1">← Back</button>
              <h1 className="text-xl font-bold text-text-primary mb-1">Join Company</h1>
              <p className="text-sm text-text-muted mb-6">Enter the 6-character invite code from your company admin.</p>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Invite Code</label>
              <input
                type="text"
                className="w-full bg-bg border border-surface-2 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-info/60 mb-4 font-mono tracking-widest uppercase"
                placeholder="e.g. AB1C2D"
                maxLength={6}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-info text-bg font-bold py-2.5 rounded-xl text-sm hover:bg-info/90 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Joining…' : 'Join Company'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
