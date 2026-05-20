/**
 * Firebase seed script — run with:
 *   node seed.js
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var or Firebase Admin SDK
 * configured with your service account.
 *
 * Install admin SDK first: npm install firebase-admin
 */

const admin = require('firebase-admin')

// Initialize with service account (update path)
// const serviceAccount = require('./serviceAccountKey.json')
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

// Or use Application Default Credentials
admin.initializeApp()

const db = admin.firestore()

async function seed() {
  console.log('Seeding RailBuild Pro demo data...')

  // Projects
  const projects = [
    {
      name: 'Mumbai–Ahmedabad HSR Corridor',
      zone: 'Zone A', type: 'track_laying', status: 'on_track',
      progressPercent: 67, budgetCr: 4200, budgetUsedCr: 2890,
      workerCount: 312, startDate: '2024-01-15', targetDate: '2026-06-30',
    },
    {
      name: 'Surat Viaduct Construction',
      zone: 'Zone B', type: 'bridgework', status: 'at_risk',
      progressPercent: 43, budgetCr: 890, budgetUsedCr: 620,
      workerCount: 87, startDate: '2024-03-01', targetDate: '2025-12-31',
    },
    {
      name: 'Sabarmati Depot Electrification',
      zone: 'Zone C', type: 'electrical', status: 'delayed',
      progressPercent: 28, budgetCr: 340, budgetUsedCr: 180,
      workerCount: 54, startDate: '2024-05-10', targetDate: '2025-09-30',
    },
    {
      name: 'Vadodara Station Signaling',
      zone: 'Zone D', type: 'signaling', status: 'completed',
      progressPercent: 100, budgetCr: 120, budgetUsedCr: 118,
      workerCount: 22, startDate: '2023-11-01', targetDate: '2024-08-31',
    },
  ]

  for (const p of projects) {
    await db.collection('projects').add({ ...p, createdAt: admin.firestore.FieldValue.serverTimestamp() })
  }
  console.log('✓ Projects seeded')

  // Workers
  const workers = [
    { name: 'Rajesh Kumar', initials: 'RK', role: 'Track Foreman', zone: 'Zone A', phone: '+91 98765 43210', status: 'active', hoursToday: 8, certifications: ['Rail Safety', 'First Aid'] },
    { name: 'Priya Sharma', initials: 'PS', role: 'Site Engineer', zone: 'Zone B', phone: '+91 87654 32109', status: 'active', hoursToday: 9, certifications: ['Rail Safety', 'PPE Supervisor'] },
    { name: 'Mohammed Aslam', initials: 'MA', role: 'Welder', zone: 'Zone A', phone: '+91 76543 21098', status: 'on_break', hoursToday: 5, certifications: ['Welding Safety'] },
    { name: 'Sunita Patel', initials: 'SP', role: 'Safety Officer', zone: 'Zone C', phone: '+91 65432 10987', status: 'active', hoursToday: 7, certifications: ['Rail Safety', 'First Aid', 'NEBOSH'] },
    { name: 'Vikram Singh', initials: 'VS', role: 'Machine Operator', zone: 'Zone D', phone: '+91 54321 09876', status: 'absent', hoursToday: 0, certifications: ['Machine Operation'] },
  ]

  for (const w of workers) {
    await db.collection('workers').add({ ...w, createdAt: admin.firestore.FieldValue.serverTimestamp() })
  }
  console.log('✓ Workers seeded')

  // Equipment
  const equipment = [
    { name: 'TLM-01 Track Layer', type: 'Track Layer', zone: 'Zone A', status: 'operational', hoursToday: 11, lastServiceDate: '2025-04-15', nextServiceDate: '2025-07-15' },
    { name: 'CAT 320 Excavator', type: 'Excavator', zone: 'Zone B', status: 'in_repair', hoursToday: 0, lastServiceDate: '2025-03-20', nextServiceDate: '2025-06-20' },
    { name: 'Liebherr LTM 1070 Crane', type: 'Crane', zone: 'Zone B', status: 'operational', hoursToday: 7, lastServiceDate: '2025-04-01', nextServiceDate: '2025-07-01' },
    { name: 'Tamping Machine TM-400', type: 'Tamping Machine', zone: 'Zone A', status: 'service_due', hoursToday: 4, lastServiceDate: '2025-01-10', nextServiceDate: '2025-05-10' },
    { name: 'Kirloskar DG Set 500kVA', type: 'Generator', zone: 'Zone C', status: 'operational', hoursToday: 14, lastServiceDate: '2025-04-20', nextServiceDate: '2025-07-20' },
  ]

  for (const e of equipment) {
    await db.collection('equipment').add({ ...e, createdAt: admin.firestore.FieldValue.serverTimestamp() })
  }
  console.log('✓ Equipment seeded')

  // Inventory
  const inventory = [
    { name: 'UIC 60 Rail Sections', category: 'Rails', quantity: 8450, unit: 'm', reorderLevel: 5000, status: 'ok' },
    { name: 'Concrete Sleepers', category: 'Sleepers', quantity: 12300, unit: 'pcs', reorderLevel: 10000, status: 'ok' },
    { name: 'Elastic Rail Clips (ERC)', category: 'Fasteners', quantity: 42000, unit: 'pcs', reorderLevel: 50000, status: 'reorder_soon' },
    { name: 'Track Ballast (Granite)', category: 'Ballast', quantity: 180, unit: 't', reorderLevel: 500, status: 'low_stock' },
    { name: 'Fishplates M24', category: 'Fasteners', quantity: 6200, unit: 'sets', reorderLevel: 4000, status: 'ok' },
    { name: 'Safety Helmets', category: 'Safety', quantity: 85, unit: 'pcs', reorderLevel: 100, status: 'reorder_soon' },
    { name: 'OHE Copper Wire', category: 'Electrical', quantity: 2300, unit: 'm', reorderLevel: 3000, status: 'low_stock' },
  ]

  for (const i of inventory) {
    await db.collection('inventory').add({ ...i, createdAt: admin.firestore.FieldValue.serverTimestamp() })
  }
  console.log('✓ Inventory seeded')

  console.log('\n✅ Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
