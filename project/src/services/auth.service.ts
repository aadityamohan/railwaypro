import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firestore'
import type { AppUser } from '@/types'

export async function signUp(
  name: string,
  email: string,
  password: string,
  companyCode: string
): Promise<AppUser> {
  const code = companyCode.toUpperCase()

  // Validate company code before creating the account (public read allowed)
  const companySnap = await getDoc(doc(db, COLLECTIONS.COMPANIES, code))
  if (!companySnap.exists()) {
    throw new Error('Invalid company code. Ask your admin for the correct invite code.')
  }
  const companyName = (companySnap.data().name as string) ?? ''

  const { user } = await createUserWithEmailAndPassword(auth, email, password)

  const newUser: AppUser = {
    uid: user.uid,
    email: user.email ?? email,
    name,
    role: 'worker',
    avatarInitials: name.slice(0, 2).toUpperCase(),
    companyId: code,
    companyName,
  }

  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), newUser)
  } catch (err) {
    // Clean up the auth account so the user can retry
    await user.delete().catch(() => {})
    throw err
  }

  return newUser
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return fetchUserDoc(user)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function fetchUserDoc(user: User): Promise<AppUser> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    // Always inject uid from Firebase Auth — Firestore docs may not have it
    return { uid: user.uid, ...snap.data() } as AppUser
  }
  // Create user doc if missing (first login)
  const newUser: AppUser = {
    uid: user.uid,
    email: user.email ?? '',
    name: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    role: 'worker',
    avatarInitials: (user.displayName ?? user.email ?? 'U').slice(0, 2).toUpperCase(),
  }
  await setDoc(ref, newUser)
  return newUser
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
