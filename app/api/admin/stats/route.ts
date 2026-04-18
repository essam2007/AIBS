import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totalUsers, activeListings, totalDeals, pendingKyc] = await Promise.all([
    db.user.count(),
    db.listing.count({ where: { status: 'ACTIVE' } }),
    db.deal.count(),
    db.user.count({ where: { kycStatus: 'PENDING' } }),
  ])

  return NextResponse.json({ totalUsers, activeListings, totalDeals, pendingKyc })
}
