import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppUser,
  Project,
  Task,
  Worker,
  Equipment,
  InventoryItem,
  Incident,
  AuditLog,
  Retailer,
} from '@/types'

interface UIState {
  drawerOpen: boolean
  activeModal: string | null
  modalPayload: Record<string, unknown> | null
}

interface AppState {
  // Auth
  currentUser: AppUser | null
  authLoading: boolean

  // Data
  projects: Project[]
  tasks: Task[]
  workers: Worker[]
  equipment: Equipment[]
  inventory: InventoryItem[]
  incidents: Incident[]
  auditLogs: AuditLog[]
  retailers: Retailer[]

  // UI
  ui: UIState

  // Auth actions
  setCurrentUser: (user: AppUser | null) => void
  setAuthLoading: (loading: boolean) => void

  // Data setters
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setWorkers: (workers: Worker[]) => void
  setEquipment: (equipment: Equipment[]) => void
  setInventory: (inventory: InventoryItem[]) => void
  setIncidents: (incidents: Incident[]) => void
  setAuditLogs: (logs: AuditLog[]) => void
  setRetailers: (retailers: Retailer[]) => void

  // UI actions
  openDrawer: () => void
  closeDrawer: () => void
  openModal: (name: string, payload?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // Auth
      currentUser: null,
      authLoading: true,

      // Data
      projects: [],
      tasks: [],
      workers: [],
      equipment: [],
      inventory: [],
      incidents: [],
      auditLogs: [],
      retailers: [],

      // UI
      ui: {
        drawerOpen: false,
        activeModal: null,
        modalPayload: null,
      },

      // Auth actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setAuthLoading: (loading) => set({ authLoading: loading }),

      // Data setters
      setProjects: (projects) => set({ projects }),
      setTasks: (tasks) => set({ tasks }),
      setWorkers: (workers) => set({ workers }),
      setEquipment: (equipment) => set({ equipment }),
      setInventory: (inventory) => set({ inventory }),
      setIncidents: (incidents) => set({ incidents }),
      setAuditLogs: (logs) => set({ auditLogs: logs }),
      setRetailers: (retailers) => set({ retailers }),

      // UI actions
      openDrawer: () => set((s) => ({ ui: { ...s.ui, drawerOpen: true } })),
      closeDrawer: () => set((s) => ({ ui: { ...s.ui, drawerOpen: false } })),
      openModal: (name, payload = {}) =>
        set((s) => ({ ui: { ...s.ui, activeModal: name, modalPayload: payload } })),
      closeModal: () =>
        set((s) => ({ ui: { ...s.ui, activeModal: null, modalPayload: null } })),
    }),
    { name: 'railbuild-store' }
  )
)

// Selectors
export const useCurrentUser = () => useStore((s) => s.currentUser)
export const useAuthLoading = () => useStore((s) => s.authLoading)
export const useProjects = () => useStore((s) => s.projects)
export const useTasks = () => useStore((s) => s.tasks)
export const useWorkers = () => useStore((s) => s.workers)
export const useEquipment = () => useStore((s) => s.equipment)
export const useInventory = () => useStore((s) => s.inventory)
export const useIncidents = () => useStore((s) => s.incidents)
export const useAuditLogs = () => useStore((s) => s.auditLogs)
export const useRetailers = () => useStore((s) => s.retailers)
export const useUI = () => useStore((s) => s.ui)
