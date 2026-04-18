import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── GET /api/brokers ──────────────────────────────────────────────────────────
// Returns all verified brokers with deal/listing stats and average ratings
export async function GET(_req: NextRequest) {
  try {
    const brokers = await db.user.findMany({
      where: {
        role: 'BROKER',
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        image: true,
        country: true,
        city: true,
        phone: true,
        whatsapp: true,
        isVerified: true,
        kycStatus: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            isVerified: true,
            country: true,
            city: true,
            website: true,
            logo: true,
            dmccMember: true,
          },
        },
        _count: {
          select: {
            brokerDeals: true,
            sellerDeals: true,
            listings: true,
          },
        },
        ratingsRcvd: {
          select: {
            score: true,
            reliability: true,
            speed: true,
            expertise: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Compute average rating per broker and strip the raw ratings from response
    const brokersWithStats = brokers.map(({ ratingsRcvd, ...broker }) => {
      let avgRating: number | null = null

      if (ratingsRcvd.length > 0) {
        const sum = ratingsRcvd.reduce(
          (acc, r) => acc + (r.score + r.reliability + r.speed + r.expertise) / 4,
          0
        )
        avgRating = Math.round((sum / ratingsRcvd.length) * 10) / 10
      }

      return {
        ...broker,
        avgRating,
        totalRatings: ratingsRcvd.length,
      }
    })

    return NextResponse.json({ brokers: brokersWithStats })
  } catch (err) {
    console.error('[GET /api/brokers]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
