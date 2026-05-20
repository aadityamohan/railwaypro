import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-surface border border-accent/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-fade-up">
      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Download size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">Install RailBuild Pro</p>
        <p className="text-xs text-text-muted mt-0.5">Add to home screen for offline access</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-3 py-1.5 bg-accent text-bg text-xs font-semibold rounded-lg flex-shrink-0"
      >
        Install
      </button>
      <button
        onClick={() => setVisible(false)}
        className="p-1 text-text-muted hover:text-text-primary flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  )
}
