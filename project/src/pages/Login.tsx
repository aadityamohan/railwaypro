import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Train, Eye, EyeOff, Lock, Mail, User, KeyRound } from 'lucide-react'
import { signIn, signUp } from '@/services/auth.service'
import { useStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils'

type Tab = 'signin' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const [tab, setTab] = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Sign in fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign up fields
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suCode, setSuCode] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!siEmail || !siPassword) { toast.error('Please enter email and password'); return }
    setLoading(true)
    try {
      const user = await signIn(siEmail, siPassword)
      setCurrentUser(user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        toast.error('Invalid email or password')
      } else {
        toast.error('Login failed. Check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!suName.trim())          { toast.error('Name is required'); return }
    if (!suEmail.trim())         { toast.error('Email is required'); return }
    if (suPassword.length < 6)   { toast.error('Password must be at least 6 characters'); return }
    if (suCode.trim().length !== 6) { toast.error('Enter the 6-character company invite code'); return }
    setLoading(true)
    try {
      const user = await signUp(suName.trim(), suEmail.trim(), suPassword, suCode.trim())
      setCurrentUser(user)
      toast.success(`Welcome, ${user.name}! You've joined ${user.companyName}.`)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email-already-in-use')) {
        toast.error('An account with this email already exists')
      } else if (msg.includes('Invalid company code')) {
        toast.error(msg)
      } else {
        toast.error('Sign up failed. Check your details and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 animate-fade-up">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4 border border-accent/30">
          <Train size={32} className="text-accent" />
        </div>
        <h1 className="font-mono font-bold text-2xl text-text-primary tracking-wider">RAILBUILD PRO</h1>
        <p className="text-text-muted text-sm mt-1">Railway Construction OS</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-surface rounded-2xl mb-6">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setShowPw(false) }}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                tab === t ? 'bg-accent text-bg' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Sign In Form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@railwaycorp.com"
              value={siEmail}
              onChange={(e) => setSiEmail(e.target.value)}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 bottom-2.5 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Sign In
            </Button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={suName}
              onChange={(e) => setSuName(e.target.value)}
              icon={<User size={16} />}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@railwaycorp.com"
              value={suEmail}
              onChange={(e) => setSuEmail(e.target.value)}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={suPassword}
                onChange={(e) => setSuPassword(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 bottom-2.5 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Company invite code */}
            <div>
              <Input
                label="Company Invite Code"
                type="text"
                placeholder="e.g. AB1C2D"
                value={suCode}
                onChange={(e) => setSuCode(e.target.value.toUpperCase())}
                icon={<KeyRound size={16} />}
                autoComplete="off"
                maxLength={6}
              />
              <p className="text-[11px] text-text-muted mt-1.5 px-1">
                Ask your company admin for the 6-character invite code.
              </p>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-text-muted mt-6">
          Railway Construction Management System
        </p>
        <p className="text-center text-xs text-text-muted/50 mt-1">
          v1.0 · Powered by <span className="text-accent/70 font-medium">Aaditya Mohan</span>
        </p>
      </div>
    </div>
  )
}
