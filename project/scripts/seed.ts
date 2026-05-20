// scripts/seed.ts
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

// Firebase config is read from environment variables. Run via:
//   npm run seed
// which uses `node --env-file=.env` to load values from project/.env.
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missing = required.filter(k => !process.env[k])
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`)
  console.error('Create project/.env from project/.env.example and try again.')
  process.exit(1)
}

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY!,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.VITE_FIREBASE_APP_ID!,
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

const now  = Timestamp.now()
const days = (n: number) => Timestamp.fromMillis(Date.now() + n * 86_400_000)

async function seed() {
  console.log('🌱 Seeding Firestore...\n')

  // ── PROJECTS ────────────────────────────────────────────
  const projects = [
    {
      name: 'Mumbai–Pune HSR', zone: 'Zone 3', type: 'Track Laying',
      status: 'on_track', progressPercent: 78,
      budgetCr: 450, budgetUsedCr: 324,
      workerCount: 24,
      description: 'High speed rail corridor km 0–120',
      startDate: days(-180), targetDate: days(200),
      createdAt: now, updatedAt: now,
    },
    {
      name: 'Delhi Metro Phase 4', zone: 'Zone 7', type: 'Bridge Works',
      status: 'delayed', progressPercent: 41,
      budgetCr: 820, budgetUsedCr: 885,
      workerCount: 18,
      description: 'Metro corridor with 6 elevated stations',
      startDate: days(-300), targetDate: days(-30),
      createdAt: now, updatedAt: now,
    },
    {
      name: 'Ahmedabad–Surat Freight', zone: 'Zone 1', type: 'Earthworks',
      status: 'at_risk', progressPercent: 55,
      budgetCr: 290, budgetUsedCr: 255,
      workerCount: 31,
      description: 'Dedicated freight corridor 240km stretch',
      startDate: days(-120), targetDate: days(120),
      createdAt: now, updatedAt: now,
    },
    {
      name: 'Bangalore Suburban Rail', zone: 'Zone 2', type: 'Signalling',
      status: 'on_track', progressPercent: 89,
      budgetCr: 180, budgetUsedCr: 117,
      workerCount: 9,
      description: 'BMRCL suburban line signalling & OHE',
      startDate: days(-250), targetDate: days(40),
      createdAt: now, updatedAt: now,
    },
  ]

  const projIds: string[] = []
  for (const p of projects) {
    const ref = await addDoc(collection(db, 'projects'), p)
    projIds.push(ref.id)
    console.log(`  ✅ Project: ${p.name}`)
  }

  // ── WORKERS ─────────────────────────────────────────────
  const workers = [
    { name: 'Rajesh Singh',  initials: 'RS', role: 'Site Supervisor',    zone: 'Zone 3', phone: '+91 98100 11111', status: 'active',   hoursToday: 8.5, certifications: [], projectId: projIds[0], createdAt: now },
    { name: 'Priya Kumari',  initials: 'PK', role: 'Track Engineer',     zone: 'Zone 1', phone: '+91 98100 22222', status: 'active',   hoursToday: 6.0, certifications: [], projectId: projIds[2], createdAt: now },
    { name: 'Arjun Mehta',   initials: 'AM', role: 'Machinery Operator', zone: 'Zone 3', phone: '+91 98100 33333', status: 'on_break', hoursToday: 5.0, certifications: [], projectId: projIds[0], createdAt: now },
    { name: 'Neha Khanna',   initials: 'NK', role: 'Safety Inspector',   zone: 'Zone 7', phone: '+91 98100 44444', status: 'absent',   hoursToday: 0,   certifications: [], projectId: projIds[1], createdAt: now },
    { name: 'Dhruv Verma',   initials: 'DV', role: 'Electrician',        zone: 'Zone 2', phone: '+91 98100 55555', status: 'active',   hoursToday: 6.5, certifications: [], projectId: projIds[3], createdAt: now },
    { name: 'Suresh Patil',  initials: 'SP', role: 'Track Labourer',     zone: 'Zone 3', phone: '+91 98100 66666', status: 'active',   hoursToday: 7.0, certifications: [], projectId: projIds[0], createdAt: now },
  ]
  for (const w of workers) {
    await addDoc(collection(db, 'workers'), w)
    console.log(`  ✅ Worker: ${w.name}`)
  }

  // ── EQUIPMENT ───────────────────────────────────────────
  const equipment = [
    { name: 'Rail Tamping Machine #1', type: 'heavy_machinery', zone: 'Zone 3', status: 'operational', hoursToday: 6.5, totalHours: 1240, lastServiceDate: days(-30),  nextServiceDate: days(60),  assignedProjectId: projIds[0], createdAt: now, updatedAt: now },
    { name: 'Mobile Crane MK-200',     type: 'crane',           zone: 'Zone 7', status: 'in_repair',   hoursToday: 0,   totalHours: 2100, lastServiceDate: days(-90),  nextServiceDate: days(-10), assignedProjectId: projIds[1], createdAt: now, updatedAt: now },
    { name: 'Diesel Generator G-3',    type: 'generator',       zone: 'Zone 1', status: 'service_due', hoursToday: 8.0, totalHours: 3400, lastServiceDate: days(-91),  nextServiceDate: days(-1),  assignedProjectId: projIds[2], createdAt: now, updatedAt: now },
    { name: 'Excavator JD-350',        type: 'heavy_machinery', zone: 'Zone 1', status: 'operational', hoursToday: 7.2, totalHours: 890,  lastServiceDate: days(-20),  nextServiceDate: days(70),  assignedProjectId: projIds[2], createdAt: now, updatedAt: now },
    { name: 'Ballast Wagon Train',     type: 'vehicle',         zone: 'Zone 3', status: 'operational', hoursToday: 5.5, totalHours: 560,  lastServiceDate: days(-15),  nextServiceDate: days(75),  assignedProjectId: projIds[0], createdAt: now, updatedAt: now },
  ]
  for (const e of equipment) {
    await addDoc(collection(db, 'equipment'), e)
    console.log(`  ✅ Equipment: ${e.name}`)
  }

  // ── INVENTORY ───────────────────────────────────────────
  const inventory = [
    { name: 'Rail Fasteners (Type B)', category: 'track',      quantity: 1200,  unit: 'pcs',  reorderLevel: 2000, status: 'low_stock',    unitCostInr: 45,   lastUpdated: now },
    { name: 'Ballast Grade 3',         category: 'civil',      quantity: 840,   unit: 'MT',   reorderLevel: 1000, status: 'reorder_soon', unitCostInr: 1200, lastUpdated: now },
    { name: 'Concrete Sleepers',       category: 'track',      quantity: 2450,  unit: 'nos',  reorderLevel: 500,  status: 'ok',           unitCostInr: 3200, lastUpdated: now },
    { name: 'Steel Rail (UIC 60)',     category: 'track',      quantity: 18000, unit: 'kg',   reorderLevel: 5000, status: 'ok',           unitCostInr: 85,   lastUpdated: now },
    { name: 'Cement M40',              category: 'civil',      quantity: 320,   unit: 'bags', reorderLevel: 500,  status: 'low_stock',    unitCostInr: 420,  lastUpdated: now },
    { name: 'Signalling Cable',        category: 'electrical', quantity: 4200,  unit: 'm',    reorderLevel: 1000, status: 'ok',           unitCostInr: 180,  lastUpdated: now },
    { name: 'Welding Rods',            category: 'track',      quantity: 580,   unit: 'pcs',  reorderLevel: 200,  status: 'ok',           unitCostInr: 25,   lastUpdated: now },
    { name: 'Tie Plates',              category: 'track',      quantity: 95,    unit: 'nos',  reorderLevel: 300,  status: 'low_stock',    unitCostInr: 650,  lastUpdated: now },
  ]
  for (const i of inventory) {
    await addDoc(collection(db, 'inventory'), i)
    console.log(`  ✅ Inventory: ${i.name}`)
  }

  // ── TASKS ───────────────────────────────────────────────
  const tasks = [
    { title: 'Survey Zone 4 alignment',  projectId: projIds[0], projectName: 'Mumbai–Pune HSR',         assigneeName: 'Priya Kumari',  status: 'todo',        priority: 'high',   category: 'survey',     dueDate: days(14), createdAt: now, updatedAt: now },
    { title: 'Track laying km 42–47',    projectId: projIds[0], projectName: 'Mumbai–Pune HSR',         assigneeName: 'Arjun Mehta',   status: 'in_progress', priority: 'urgent', category: 'mech',       dueDate: days(7),  createdAt: now, updatedAt: now },
    { title: 'Safety briefing Zone 7',   projectId: projIds[1], projectName: 'Delhi Metro Phase 4',     assigneeName: 'Neha Khanna',   status: 'todo',        priority: 'urgent', category: 'safety',     dueDate: days(1),  createdAt: now, updatedAt: now },
    { title: 'Girder placement P7–P9',   projectId: projIds[1], projectName: 'Delhi Metro Phase 4',     assigneeName: 'Arjun Mehta',   status: 'in_progress', priority: 'urgent', category: 'civil',      dueDate: days(5),  createdAt: now, updatedAt: now },
    { title: 'Embankment compaction',    projectId: projIds[2], projectName: 'Ahmedabad–Surat Freight', assigneeName: 'Rajesh Singh',  status: 'in_progress', priority: 'medium', category: 'civil',      dueDate: days(10), createdAt: now, updatedAt: now },
    { title: 'Order ballast Grade 3',    projectId: projIds[2], projectName: 'Ahmedabad–Surat Freight', assigneeName: 'Rajesh Singh',  status: 'todo',        priority: 'medium', category: 'inventory',  dueDate: days(5),  createdAt: now, updatedAt: now },
    { title: 'Signalling cable routing', projectId: projIds[3], projectName: 'Bangalore Suburban Rail', assigneeName: 'Dhruv Verma',   status: 'in_progress', priority: 'medium', category: 'electrical', dueDate: days(8),  createdAt: now, updatedAt: now },
    { title: 'Sleeper installation Z3',  projectId: projIds[0], projectName: 'Mumbai–Pune HSR',         assigneeName: 'Rajesh Singh',  status: 'done',        priority: 'high',   category: 'track',      dueDate: days(-2), completedAt: days(-2), createdAt: now, updatedAt: now },
  ]
  for (const t of tasks) {
    await addDoc(collection(db, 'tasks'), t)
    console.log(`  ✅ Task: ${t.title}`)
  }

  console.log('\n🎉 Seed complete! Open Firestore Console to verify.')
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
