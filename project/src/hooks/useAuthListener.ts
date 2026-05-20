import { useEffect } from 'react'
import { onAuthChange, fetchUserDoc } from '@/services/auth.service'
import { useStore } from '@/store'

export function useAuthListener() {
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const setAuthLoading = useStore((s) => s.setAuthLoading)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await fetchUserDoc(firebaseUser)
          setCurrentUser(appUser)
        } catch {
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
      setAuthLoading(false)
    })
    return unsub
  }, [setCurrentUser, setAuthLoading])
}
