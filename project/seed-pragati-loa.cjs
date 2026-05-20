/**
 * Seed script — LOA: Hume Bridge Replacement, Chunar-Chopan (NCR)
 * Contractor: M/s Pragati Construction Co, Allahabad
 *
 * Finds the Pragati company by name and adds:
 *   - 1 Project
 *   - Key Tasks (work phases)
 *   - Material Inventory
 *   - Equipment
 *
 * Run: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node seed-pragati-loa.js
 */

const admin = require('firebase-admin')
admin.initializeApp({ projectId: 'railwaypro-17927' })
const db = admin.firestore()
const ts = admin.firestore.FieldValue.serverTimestamp

async function findPragatiCompanyId() {
  const snap = await db.collection('companies').get()
  for (const doc of snap.docs) {
    const name = (doc.data().name || '').toLowerCase()
    if (name.includes('pragati')) return doc.id
  }
  return null
}

async function seed() {
  console.log('Looking up Pragati Construction company...')
  const companyId = await findPragatiCompanyId()
  if (!companyId) {
    console.error('❌  No company matching "Pragati" found. Create/join the company in the app first.')
    process.exit(1)
  }
  console.log(`✓ Found company: ${companyId}`)

  const col = (sub) => db.collection('companies').doc(companyId).collection(sub)

  // ── PROJECT ────────────────────────────────────────────────────────────────
  const projectRef = await col('projects').add({
    name: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
    zone: 'Chunar–Chopan Section (ADEN/CAR)',
    type: 'bridgework',
    status: 'on_track',
    progressPercent: 0,
    budgetCr: 7.38,          // ₹7,37,69,916.18
    budgetUsedCr: 0,
    workerCount: 0,
    startDate: '2026-04-14', // LOA date
    targetDate: '2027-10-14', // 18 months from LOA
    notes: 'Tender No. 9720252026-233 | LOA dated 14/04/2026 | North Central Rly, Prayagraj Division-ENGG | Sr.DEN/I/ALD: Arun Kumar',
    createdAt: ts(),
    updatedAt: ts(),
  })
  const projectId = projectRef.id
  console.log(`✓ Project created: ${projectId}`)

  // ── TASKS ──────────────────────────────────────────────────────────────────
  // Due dates derived from 18-month contract: LOA 14 Apr 2026 → completion 14 Oct 2027
  const tasks = [
    {
      title: 'Submit Performance Guarantee (5% = ₹36,88,496)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'urgent', status: 'todo',
      dueDate: '2026-05-05', // 21 days from LOA
      assigneeId: '', assigneeName: '',
      notes: 'PG of ₹36,88,495.81 to be submitted to Sr.DFM/NCR/Prayagraj within 21 days of LOA (by 05-May-2026). Penal interest 12% p.a. after 21 days.',
    },
    {
      title: 'Report to ADEN/CAR & Sign Contract Agreement',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'general', priority: 'urgent', status: 'todo',
      dueDate: '2026-04-21', // 7 days from LOA
      assigneeId: '', assigneeName: '',
      notes: 'Report to ADEN/CAR within 7 days. Attend office within 30 days to sign contract agreement with PG.',
    },
    {
      title: 'Soil Investigation & Borehole Drilling (270m)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2026-06-30',
      assigneeId: '', assigneeName: '',
      notes: '150mm dia. boreholes 0–10m depth. Lab tests: moisture, Atterberg limits, specific gravity, grain size, direct shear, consolidation, tri-axial. 4 borehole locations.',
    },
    {
      title: 'Prepare GAD/TAD/Launching Scheme for Bridges (4 Nos)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2026-07-31',
      assigneeId: '', assigneeName: '',
      notes: 'Preparation of GAD/TAD/Launching Scheme for 4 minor/major bridges as per NS2 item.',
    },
    {
      title: 'Earthwork — Embankment Filling (5000 cum, SQ1)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2026-10-31',
      assigneeId: '', assigneeName: '',
      notes: '5000 cum filling with SQ1 soil. Mechanical compaction, RDSO/2020/GE:IRS-0004. Rate: ₹281.85/cum. Amount: ₹14,09,250.',
    },
    {
      title: 'Foundation Excavation (1600 cum soil + 150 soft rock + 250 hard rock)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2026-09-30',
      assigneeId: '', assigneeName: '',
      notes: 'All kinds of soils 1600 cum (₹3,14,656) + Soft rock 150 cum (₹60,802.50) + Hard rock 250 cum (₹2,78,602.50). Hydraulic excavator.',
    },
    {
      title: 'PCC 1:3:6 Foundations (200 cum)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'medium', status: 'todo',
      dueDate: '2026-11-30',
      assigneeId: '', assigneeName: '',
      notes: '200 cum PCC 1:3:6 for misc foundations/side drains. Rate ₹3,667.29/cum. Amount: ₹7,33,458.',
    },
    {
      title: 'RCC Box Casting — Bottom/Top Slab & Side Walls (940 cum)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2027-04-30',
      assigneeId: '', assigneeName: '',
      notes: 'Machine batched/vibrated concrete Design Mix, 20mm aggregate. 940 cum @ ₹4,010.14/cum = ₹37,69,531.60. Plasticiser mandatory.',
    },
    {
      title: 'RCC Wing Walls & Approach Slabs (400 + 200 cum)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2027-05-31',
      assigneeId: '', assigneeName: '',
      notes: 'Wing wall/return wall 400 cum (₹14,90,100) + Approach slab/dirt wall 200 cum (₹7,37,082). Total: ₹22,27,182.',
    },
    {
      title: 'Centering & Shuttering — Sub-structure (3000 sqm) + Super-structure (750 sqm)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'medium', status: 'todo',
      dueDate: '2027-05-31',
      assigneeId: '', assigneeName: '',
      notes: 'Sub-structure 3000 sqm @ ₹661.48 = ₹19,84,440 | Super-structure 750 sqm @ ₹860.71 = ₹6,45,532.50.',
    },
    {
      title: 'Waterproofing — Coal Tar/Bitumen on RCC Box (1800 sqm)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'medium', status: 'todo',
      dueDate: '2027-06-30',
      assigneeId: '', assigneeName: '',
      notes: '2 coats coal tar/bitumen @ 1.70 kg/sqm on top & sides of RCC box. 1800 sqm @ ₹185.09 = ₹3,33,162.',
    },
    {
      title: 'Boulder Pitching & Stone Supply (1000 + 750 cum)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'medium', status: 'todo',
      dueDate: '2027-06-30',
      assigneeId: '', assigneeName: '',
      notes: 'Stone boulders supply 1000 cum (₹11,53,970) + Boulder pitching 1:4 CM 750 cum (₹21,49,125). Filter media 400 cum (₹11,75,636).',
    },
    {
      title: 'Grouting Works — Neat Cement (4500 kg) + Epoxy (750 kg)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'low', status: 'todo',
      dueDate: '2027-07-31',
      assigneeId: '', assigneeName: '',
      notes: 'Neat cement grout 4500 kg (₹16,05,780) + Epoxy grout 750 kg (₹10,11,765). 300 nipples (₹20,085).',
    },
    {
      title: 'Track Works — Rail Renewal & Sleeper Replacement',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'track', priority: 'high', status: 'todo',
      dueDate: '2027-08-31',
      assigneeId: '', assigneeName: '',
      notes: 'Rail dismantling 797 RM (₹26,348.82) + Rail insertion 797 RM (₹27,887.03) + PSC sleeper replacement 700 nos (₹3,07,258) + Rail cutting 150 nos + Rail drilling 300 nos. Under traffic block.',
    },
    {
      title: 'Ballast Supply & Recoupment (1500 cum Track + 1500 cum Stacking)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'track', priority: 'medium', status: 'todo',
      dueDate: '2027-09-30',
      assigneeId: '', assigneeName: '',
      notes: 'Track ballast supply 1500 cum @ ₹1,596.49/cum (₹23,94,735) + Ballast recoupment 1500 cum (₹1,43,280).',
    },
    {
      title: 'Road Crane 250 MT — Erection of RCC Box (160 days)',
      projectId, projectName: 'Hume Pipe/Slab Bridge → RCC Box Replacement',
      category: 'civil', priority: 'high', status: 'todo',
      dueDate: '2027-07-31',
      assigneeId: '', assigneeName: '',
      notes: '250 MT revolving road crane for girder/RCC box erection. 160 days @ ₹3,44,872.10/day = ₹5,51,79,536. Largest single item in contract.',
    },
  ]

  for (const t of tasks) {
    await col('tasks').add({ ...t, createdAt: ts(), updatedAt: ts() })
  }
  console.log(`✓ ${tasks.length} tasks created`)

  // ── INVENTORY ──────────────────────────────────────────────────────────────
  const inventory = [
    {
      name: 'OPC Cement 43 Grade',
      category: 'Concrete',
      quantity: 619.45, unit: 'MT',
      reorderLevel: 100,
      status: 'ok',
      pricePerUnit: 8153.06,
      notes: 'Approved brands/makes. Item 025071. Required for RCC box, wing walls, grouting.',
    },
    {
      name: 'TMT Steel Fe-500D Bars',
      category: 'Steel',
      quantity: 164315, unit: 'Kg',
      reorderLevel: 20000,
      status: 'ok',
      pricePerUnit: 80.14,
      notes: 'Thermo-Mechanically Treated Fe-500D or higher. Item 025082. ₹1,31,68,204.10 total.',
    },
    {
      name: 'Track Ballast (Railway Spec)',
      category: 'Track',
      quantity: 1500, unit: 'cum',
      reorderLevel: 300,
      status: 'ok',
      pricePerUnit: 1596.49,
      notes: 'Confirming to Railway Specification. Item NS1. For stacking at bridge locations.',
    },
    {
      name: 'Stone Boulders (>35 kg each)',
      category: 'Civil',
      quantity: 1000, unit: 'cum',
      reorderLevel: 200,
      status: 'ok',
      pricePerUnit: 1153.97,
      notes: 'Min 35 kg each for bridge pitching. Item 051030.',
    },
    {
      name: 'Quarry Dust',
      category: 'Civil',
      quantity: 300, unit: 'cum',
      reorderLevel: 50,
      status: 'ok',
      pricePerUnit: 1274.00,
      notes: 'For loose slush conditions at foundation before casting. Item 052030.',
    },
    {
      name: 'Sand Bags (50 kg polythene)',
      category: 'Safety',
      quantity: 15000, unit: 'Each',
      reorderLevel: 2000,
      status: 'ok',
      pricePerUnit: 14.12,
      notes: 'Railway sand/quarry dust filled, stitched with polythene thread. Item 211230.',
    },
    {
      name: 'Neat Cement Grout (anti-shrinkage 20%)',
      category: 'Concrete',
      quantity: 4500, unit: 'Kg',
      reorderLevel: 500,
      status: 'ok',
      pricePerUnit: 356.84,
      notes: 'With 20% anti-shrinkage compound. Item 052071.',
    },
    {
      name: 'Epoxy Grout',
      category: 'Concrete',
      quantity: 750, unit: 'Kg',
      reorderLevel: 100,
      status: 'ok',
      pricePerUnit: 1349.02,
      notes: 'For crack sealing via injection grouting. Item 052073.',
    },
  ]

  for (const i of inventory) {
    await col('inventory').add({ ...i, createdAt: ts() })
  }
  console.log(`✓ ${inventory.length} inventory items created`)

  // ── EQUIPMENT ──────────────────────────────────────────────────────────────
  const equipment = [
    {
      name: 'Road Crane 250 MT (Revolving)',
      type: 'Crane',
      zone: 'Chunar–Chopan Section',
      status: 'operational',
      hoursToday: 0,
      lastServiceDate: '',
      nextServiceDate: '',
      notes: 'Item 041208. 250 MT capacity revolving road crane for RCC box erection. 160 days contracted @ ₹3,44,872.10/day.',
    },
    {
      name: 'JCB Backhoe Loader 3DX Plus',
      type: 'Excavator',
      zone: 'Chunar–Chopan Section',
      status: 'operational',
      hoursToday: 0,
      lastServiceDate: '',
      nextServiceDate: '',
      notes: 'Item 211201. Min 1.10 cum bucket capacity. 150 hours contracted @ ₹794.59/hour.',
    },
    {
      name: 'Concrete Batching/Mixing Plant',
      type: 'Other',
      zone: 'Chunar–Chopan Section',
      status: 'operational',
      hoursToday: 0,
      lastServiceDate: '',
      nextServiceDate: '',
      notes: 'Mobile concrete batching plant at site for Design Mix concrete for RCC box and structural elements.',
    },
    {
      name: 'Rail Cutting Machine (Saw Type)',
      type: 'Other',
      zone: 'Chunar–Chopan Section',
      status: 'operational',
      hoursToday: 0,
      lastServiceDate: '',
      nextServiceDate: '',
      notes: 'RDSO Spec TM/SM/4 dated 24.04.1991. Item 161026. 150 rail cuts on running line.',
    },
    {
      name: 'Rail Drilling Machine',
      type: 'Other',
      zone: 'Chunar–Chopan Section',
      status: 'operational',
      hoursToday: 0,
      lastServiceDate: '',
      nextServiceDate: '',
      notes: 'RDSO Spec TM/SM/3 dated 24.04.1991. Item 161042. 300 holes 16–32mm dia on running line.',
    },
  ]

  for (const e of equipment) {
    await col('equipment').add({ ...e, createdAt: ts() })
  }
  console.log(`✓ ${equipment.length} equipment records created`)

  console.log('\n✅ Pragati LOA data seeded successfully!')
  console.log(`   Company ID : ${companyId}`)
  console.log(`   Project ID : ${projectId}`)
  console.log(`   Contract   : ₹7,37,69,916 | Chunar–Chopan RCC Box Bridges`)
  console.log(`   Timeline   : 14 Apr 2026 → 14 Oct 2027 (18 months)`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
