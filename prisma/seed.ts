import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding GulfOilDesk database...')

  const pw = await bcrypt.hash('Password123!', 10)

  // ── Companies ────────────────────────────────────────────────────────────────
  const companies = await Promise.all([
    db.company.upsert({ where: { id: 'co-1' }, update: {}, create: { id: 'co-1', name: 'Al Mashreq Energy Trading LLC', nameAr: 'شركة المشرق للطاقة', registrationNo: 'DMCC-12345', country: 'AE', city: 'Dubai', type: 'BROKER', isVerified: true, dmccMember: true, description: 'Leading oil broker in the UAE, DMCC member since 2018.' } }),
    db.company.upsert({ where: { id: 'co-2' }, update: {}, create: { id: 'co-2', name: 'Gulf Petroleum International', nameAr: 'شركة الخليج للبترول الدولية', registrationNo: 'CR-SA-88721', country: 'SA', city: 'Riyadh', type: 'SELLER', isVerified: true, description: 'Saudi-based crude oil trading company with direct Aramco allocations.' } }),
    db.company.upsert({ where: { id: 'co-3' }, update: {}, create: { id: 'co-3', name: 'Kuwait Oil Traders Co.', nameAr: 'شركة الكويت لتجار النفط', registrationNo: 'KW-OT-4421', country: 'KW', city: 'Kuwait City', type: 'BROKER', isVerified: true, description: 'Kuwait-based brokerage with 15+ years in Gulf crude markets.' } }),
    db.company.upsert({ where: { id: 'co-4' }, update: {}, create: { id: 'co-4', name: 'Oman Energy Resources LLC', nameAr: 'شركة موارد الطاقة العُمانية', registrationNo: 'OM-ER-9921', country: 'OM', city: 'Muscat', type: 'SELLER', isVerified: true } }),
    db.company.upsert({ where: { id: 'co-5' }, update: {}, create: { id: 'co-5', name: 'Qatar Refined Products Trading', nameAr: 'تداول المنتجات المكررة القطرية', registrationNo: 'QA-RP-5512', country: 'QA', city: 'Doha', type: 'SELLER', isVerified: false } }),
  ])

  // ── Users ────────────────────────────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: 'admin@gulfoildesk.com' },
    update: {},
    create: {
      email: 'admin@gulfoildesk.com', name: 'Platform Admin', password: pw,
      role: 'ADMIN', isVerified: true, kycStatus: 'APPROVED', country: 'AE', city: 'Dubai',
    },
  })

  const users = await Promise.all([
    db.user.upsert({ where: { email: 'khalid@almashreq.ae' }, update: {}, create: { email: 'khalid@almashreq.ae', name: 'Khalid Al-Rashidi', nameAr: 'خالد الراشدي', password: pw, role: 'BROKER', phone: '+971501234567', whatsapp: '+971501234567', country: 'AE', city: 'Dubai', isVerified: true, kycStatus: 'APPROVED', companyId: 'co-1' } }),
    db.user.upsert({ where: { email: 'omar@gulfpetro.sa' }, update: {}, create: { email: 'omar@gulfpetro.sa', name: 'Omar Al-Saud', nameAr: 'عمر آل سعود', password: pw, role: 'SELLER', phone: '+966501234567', country: 'SA', city: 'Riyadh', isVerified: true, kycStatus: 'APPROVED', companyId: 'co-2' } }),
    db.user.upsert({ where: { email: 'fatima@kuwaittrade.kw' }, update: {}, create: { email: 'fatima@kuwaittrade.kw', name: 'Fatima Al-Mutairi', nameAr: 'فاطمة المطيري', password: pw, role: 'BROKER', phone: '+96550123456', whatsapp: '+96550123456', country: 'KW', city: 'Kuwait City', isVerified: true, kycStatus: 'APPROVED', companyId: 'co-3' } }),
    db.user.upsert({ where: { email: 'ahmed@omanenergy.om' }, update: {}, create: { email: 'ahmed@omanenergy.om', name: 'Ahmed Al-Balushi', nameAr: 'أحمد البلوشي', password: pw, role: 'SELLER', phone: '+96890123456', country: 'OM', city: 'Muscat', isVerified: true, kycStatus: 'APPROVED', companyId: 'co-4' } }),
    db.user.upsert({ where: { email: 'sara@qatartrading.qa' }, update: {}, create: { email: 'sara@qatartrading.qa', name: 'Sara Al-Thani', nameAr: 'سارة آل ثاني', password: pw, role: 'BUYER', phone: '+97450123456', country: 'QA', city: 'Doha', isVerified: false, kycStatus: 'PENDING', companyId: 'co-5' } }),
    db.user.upsert({ where: { email: 'demo@gulfoildesk.com' }, update: {}, create: { email: 'demo@gulfoildesk.com', name: 'Demo User', nameAr: 'مستخدم تجريبي', password: pw, role: 'BROKER', country: 'AE', city: 'Dubai', isVerified: false, kycStatus: 'PENDING' } }),
  ])

  const [khalid, omar, fatima, ahmed, sara, demo] = users

  // ── Listings ────────────────────────────────────────────────────────────────
  const listingData = [
    {
      id: 'lst-1', title: 'Arab Light Crude – FOB Ras Tanura', titleAr: 'نفط عربي خفيف – FOB رأس تنورة',
      type: 'CRUDE_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Saudi Arabia', grade: 'Arab Light', refinery: 'Ras Tanura Refinery',
      quantity: 2000000, incoterms: 'FOB', loadingPort: 'Ras Tanura',
      priceType: 'PLATTS_PLUS', priceValue: 0.75, currency: 'USD',
      apiGravity: 34.2, sulfurContent: 0.18, viscosity: 5.4, waterContent: 0.05,
      pourPoint: -6, flashPoint: null, rvp: 7.1, h2sContent: 45,
      totalAcidNumber: 0.08, niContent: 8, vaContent: 18,
      vesselType: 'VLCC',
      description: 'Monthly allocation available. SGS inspection report on request. Bank-to-bank only.',
      userId: omar.id, companyId: 'co-2',
    },
    {
      id: 'lst-2', title: 'Kuwait Export Crude – CIF Rotterdam', titleAr: 'نفط الكويت للتصدير – CIF روتردام',
      type: 'CRUDE_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Kuwait', grade: 'Kuwait Export Crude (KEC)', refinery: 'Mina Al Ahmadi',
      quantity: 1000000, incoterms: 'CIF', loadingPort: 'Mina Al Ahmadi', deliveryPort: 'Rotterdam',
      priceType: 'PLATTS_PLUS', priceValue: -0.25, currency: 'USD',
      apiGravity: 31.4, sulfurContent: 2.52, viscosity: 18.2, waterContent: 0.1,
      pourPoint: -3, rvp: 6.8, h2sContent: 120,
      vesselType: 'Suezmax',
      description: 'Spot cargo. Buyer to arrange refinery acceptance. Full documentation available.',
      userId: khalid.id, companyId: 'co-1',
    },
    {
      id: 'lst-3', title: 'Oman Blend Crude – FOB Muscat', titleAr: 'نفط عُمان المُمزوج – FOB مسقط',
      type: 'CRUDE_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Oman', grade: 'Oman Blend', refinery: 'PDO Muscat',
      quantity: 500000, minQuantity: 100000, incoterms: 'FOB', loadingPort: 'Mina Al Fahal',
      priceType: 'PLATTS_PLUS', priceValue: 0.30, currency: 'USD',
      apiGravity: 33.0, sulfurContent: 1.05, viscosity: 9.8,
      niContent: 14, vaContent: 32,
      vesselType: 'Aframax',
      userId: ahmed.id, companyId: 'co-4',
    },
    {
      id: 'lst-4', title: 'Wanted: 500,000 BBL Jet A-1 – Dubai', titleAr: 'مطلوب: 500,000 برميل وقود طائرات – دبي',
      type: 'JET_A1', side: 'BUY', status: 'ACTIVE',
      origin: 'UAE', quantity: 500000, incoterms: 'CIF', deliveryPort: 'Dubai International Airport',
      priceType: 'NEGOTIABLE',
      apiGravity: 42.0, sulfurContent: 0.25, flashPoint: 38,
      description: 'Regular monthly requirement. Must meet DEF STAN 91-091 specification. Letter of credit available.',
      userId: sara.id, companyId: 'co-5',
    },
    {
      id: 'lst-5', title: 'Fuel Oil 380 CST – FOB Fujairah', titleAr: 'زيت الوقود 380 CST – FOB الفجيرة',
      type: 'FUEL_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'UAE', grade: 'HFO 380 CST', loadingPort: 'Fujairah Port',
      quantity: 30000, incoterms: 'FOB',
      priceType: 'FIXED', priceValue: 420, currency: 'USD',
      apiGravity: 14.5, sulfurContent: 3.5, viscosity: 380, waterContent: 0.5,
      pourPoint: 30, flashPoint: 65,
      description: 'Bunker quality. Available for prompt lifting. SGS report available.',
      userId: khalid.id, companyId: 'co-1',
    },
    {
      id: 'lst-6', title: 'Arab Extra Light Crude – 1M BBL Offer', titleAr: 'نفط عربي خفيف جداً – عرض مليون برميل',
      type: 'CRUDE_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Saudi Arabia', grade: 'Arab Extra Light (AXL)',
      quantity: 1000000, incoterms: 'FOB', loadingPort: 'Yanbu',
      priceType: 'PLATTS_PLUS', priceValue: 1.50, currency: 'USD',
      apiGravity: 38.5, sulfurContent: 0.06, viscosity: 3.1,
      totalAcidNumber: 0.04, niContent: 3, vaContent: 7,
      vesselType: 'Suezmax',
      userId: omar.id, companyId: 'co-2',
    },
    {
      id: 'lst-7', title: 'Basra Light – CIF Augusta', titleAr: 'نفط البصرة الخفيف – CIF أوغوستا',
      type: 'CRUDE_OIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Iraq', grade: 'Basra Light',
      quantity: 2000000, incoterms: 'CIF', loadingPort: 'Basra Oil Terminal', deliveryPort: 'Augusta, Sicily',
      priceType: 'PLATTS_PLUS', priceValue: -0.50, currency: 'USD',
      apiGravity: 29.7, sulfurContent: 2.95, viscosity: 24.0,
      niContent: 22, vaContent: 55,
      vesselType: 'VLCC',
      userId: fatima.id, companyId: 'co-3',
    },
    {
      id: 'lst-8', title: 'Gas Oil D2 – 50,000 MT FOB Black Sea', titleAr: 'زيت الغاز D2 – 50,000 طن FOB البحر الأسود',
      type: 'GASOIL', side: 'SELL', status: 'ACTIVE',
      origin: 'Russia', grade: 'D2 GOST 305-82',
      quantity: 350000, incoterms: 'FOB',
      priceType: 'PLATTS_PLUS', priceValue: -2.0, currency: 'USD',
      apiGravity: 36.0, sulfurContent: 0.2, flashPoint: 62, pourPoint: -10,
      userId: khalid.id, companyId: 'co-1',
    },
  ]

  for (const l of listingData) {
    await db.listing.upsert({
      where: { id: l.id },
      update: {},
      create: l as any,
    })
  }

  // ── Deals ────────────────────────────────────────────────────────────────────
  const deal1 = await db.deal.upsert({
    where: { id: 'deal-1' },
    update: {},
    create: {
      id: 'deal-1',
      listingId: 'lst-1', buyerId: sara.id, sellerId: omar.id, brokerId: khalid.id,
      status: 'NEGOTIATION', agreedQuantity: 1000000, agreedPrice: 76.25, agreedIncoterms: 'FOB',
      currency: 'USD', commissionPct: 0.05,
    },
  })

  const deal2 = await db.deal.upsert({
    where: { id: 'deal-2' },
    update: {},
    create: {
      id: 'deal-2',
      listingId: 'lst-2', buyerId: ahmed.id, sellerId: khalid.id,
      status: 'INQUIRY',
    },
  })

  // ── Messages ────────────────────────────────────────────────────────────────
  const msgs = [
    { dealId: 'deal-1', senderId: sara.id, content: 'Good morning. We are interested in 1M BBL of Arab Light. Please confirm availability for June lifting.' },
    { dealId: 'deal-1', senderId: omar.id, content: 'Hello Sara. Confirmed availability for June 5-15 window at Ras Tanura. Price basis: Platts Dated + $0.75/BBL. Please issue your LOI.' },
    { dealId: 'deal-1', senderId: khalid.id, content: 'I have facilitated the introduction. Both parties please coordinate through this deal room for full audit trail.' },
    { dealId: 'deal-1', senderId: sara.id, content: 'Understood. Our LOI is being prepared. Can you share the latest SGS assay report for this cargo?' },
    { dealId: 'deal-1', senderId: omar.id, content: 'SGS report attached to the listing. Our Q&Q parameters: API 34.2°, Sulfur 0.18%. DLC term: 90 days sight. Agree?' },
    { dealId: 'deal-2', senderId: ahmed.id, content: 'Hello, I am interested in Kuwait Export Crude. What is the minimum lot size and can delivery be extended to July?' },
    { dealId: 'deal-2', senderId: khalid.id, content: 'Hello Ahmed. Minimum 500,000 BBL. July window possible pending allocation confirmation. Please share company profile.' },
  ]

  for (const m of msgs) {
    await db.message.create({ data: m }).catch(() => {})
  }

  // ── Broker Ratings ──────────────────────────────────────────────────────────
  const ratings = [
    { raterId: omar.id, ratedUserId: khalid.id, dealId: 'deal-1', score: 5, reliability: 5, speed: 4, expertise: 5, comment: 'Excellent broker. Very professional and knowledgeable about Gulf markets.' },
    { raterId: sara.id, ratedUserId: khalid.id, score: 4, reliability: 4, speed: 5, expertise: 4, comment: 'Fast response and helpful in negotiations.' },
    { raterId: ahmed.id, ratedUserId: fatima.id, score: 5, reliability: 5, speed: 5, expertise: 5, comment: 'Top class broker with deep Kuwait market knowledge.' },
  ]

  for (const r of ratings) {
    await db.brokerRating.create({ data: r }).catch(() => {})
  }

  // ── Notifications ────────────────────────────────────────────────────────────
  const notifData = [
    { userId: omar.id, type: 'NEW_DEAL', title: 'New Inquiry', titleAr: 'استفسار جديد', body: 'Sara Al-Thani sent an inquiry on your Arab Light listing', bodyAr: 'أرسلت سارة آل ثاني استفساراً على قائمتك', link: '/deals/deal-1' },
    { userId: sara.id, type: 'MESSAGE', title: 'New Message', titleAr: 'رسالة جديدة', body: 'Omar Al-Saud replied in deal #deal-1', bodyAr: 'رد عمر آل سعود في الصفقة #deal-1', link: '/deals/deal-1' },
    { userId: demo.id, type: 'VERIFICATION', title: 'Complete Your KYC', titleAr: 'أكمل التحقق من هويتك', body: 'Upload your company registration to get verified and unlock all features.', bodyAr: 'ارفع سجل شركتك للتحقق وفتح جميع الميزات.', link: '/profile' },
  ]
  for (const n of notifData) {
    await db.notification.create({ data: n }).catch(() => {})
  }

  console.log('✅ Seed complete!')
  console.log('')
  console.log('👤 Login accounts:')
  console.log('   admin@gulfoildesk.com  / Password123!  (Admin)')
  console.log('   khalid@almashreq.ae    / Password123!  (Verified Broker, UAE)')
  console.log('   omar@gulfpetro.sa      / Password123!  (Verified Seller, Saudi Arabia)')
  console.log('   fatima@kuwaittrade.kw  / Password123!  (Verified Broker, Kuwait)')
  console.log('   ahmed@omanenergy.om    / Password123!  (Verified Seller, Oman)')
  console.log('   sara@qatartrading.qa   / Password123!  (Buyer, Qatar)')
  console.log('   demo@gulfoildesk.com   / Password123!  (Demo User)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
