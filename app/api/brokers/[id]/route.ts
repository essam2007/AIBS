import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, nameAr: true, email: true,
        phone: true, whatsapp: true, country: true, city: true,
        role: true, isVerified: true, kycStatus: true, createdAt: true,
        company: true,
        _count: { select: { sellerDeals: true, brokerDeals: true, listings: true } },
        ratingsRcvd: {
          select: { id: true, score: true, reliability: true, speed: true, expertise: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const avgRating = user.ratingsRcvd.length > 0
      ? user.ratingsRcvd.reduce((s, r) => s + (r.score + r.reliability + r.speed + r.expertise) / 4, 0) / user.ratingsRcvd.length
      : 0

    return NextResponse.json({ ...user, avgRating })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
