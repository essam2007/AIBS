import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ── GET /api/dashboard ────────────────────────────────────────────────────────
// Returns personalised dashboard statistics for the authenticated user
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userId = session.user.id

    // Active deal statuses (anything that is not a terminal state)
    const ACTIVE_STATUSES = [
      'INQUIRY',
      'LOI_SENT',
      'FCO_ISSUED',
      'NEGOTIATION',
      'SGS_PENDING',
      'DLC_PENDING',
      'CONTRACTED',
    ]

    // Run all queries in parallel for performance
    const [
      myListingsCount,
      myDealsCount,
      closedDeals,
      recentListings,
      recentDeals,
      unreadNotifications,
    ] = await Promise.all([
      // Total listing count for this user
      db.listing.count({
        where: { userId },
      }),

      // Active deals count (buyer | seller | broker)
      db.deal.count({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }, { brokerId: userId }],
          status: { in: ACTIVE_STATUSES },
        },
      }),

      // Closed deals — needed to compute total value
      db.deal.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }, { brokerId: userId }],
          status: 'CLOSED',
          agreedPrice: { not: null },
          agreedQuantity: { not: null },
        },
        select: {
          agreedPrice: true,
          agreedQuantity: true,
        },
      }),

      // Last 5 listings
      db.listing.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          titleAr: true,
          type: true,
          side: true,
          origin: true,
          quantity: true,
          quantityUnit: true,
          priceType: true,
          priceValue: true,
          currency: true,
          status: true,
          createdAt: true,
          _count: { select: { deals: true } },
        },
      }),

      // Last 5 deals involving the user
      db.deal.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }, { brokerId: userId }],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          agreedPrice: true,
          agreedQuantity: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          listing: {
            select: {
              id: true,
              title: true,
              titleAr: true,
              type: true,
              origin: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              role: true,
              country: true,
              isVerified: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              role: true,
              country: true,
              isVerified: true,
            },
          },
        },
      }),

      // Unread notifications count
      db.notification.count({
        where: { userId, isRead: false },
      }),
    ])

    // Compute total value of closed deals (sum of agreedPrice * agreedQuantity)
    const dealsValue = closedDeals.reduce((sum, deal) => {
      if (deal.agreedPrice != null && deal.agreedQuantity != null) {
        return sum + deal.agreedPrice * deal.agreedQuantity
      }
      return sum
    }, 0)

    return NextResponse.json({
      stats: {
        myListings: myListingsCount,
        myDeals: myDealsCount,
        dealsValue: Math.round(dealsValue * 100) / 100,
        unreadNotifications,
      },
      recentListings,
      recentDeals,
    })
  } catch (err) {
    console.error('[GET /api/dashboard]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
