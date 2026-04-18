import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ── GET /api/deals ────────────────────────────────────────────────────────────
// Returns all deals for the authenticated user (as buyer, seller, or broker)
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userId = session.user.id

    const deals = await db.deal.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
          { brokerId: userId },
        ],
      },
      include: {
        listing: {
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
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
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
            email: true,
            role: true,
            country: true,
            isVerified: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            role: true,
            country: true,
            isVerified: true,
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ deals })
  } catch (err) {
    console.error('[GET /api/deals]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── POST /api/deals ───────────────────────────────────────────────────────────
// Create a new deal inquiry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json()
    const { listingId, message, quantity } = body

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json({ error: 'listingId is required.' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'A message is required to initiate a deal inquiry.' }, { status: 400 })
    }

    if (quantity !== undefined && (isNaN(Number(quantity)) || Number(quantity) <= 0)) {
      return NextResponse.json({ error: 'Quantity must be a positive number.' }, { status: 400 })
    }

    // Fetch the listing to resolve the seller
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, status: true, title: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'This listing is no longer active.' }, { status: 409 })
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot create a deal inquiry on your own listing.' },
        { status: 409 }
      )
    }

    // Determine buyer / seller based on listing side
    const buyerId = session.user.id
    const sellerId = listing.userId

    // ── Create Deal + first Message + Notifications in a transaction ──────────
    const deal = await db.$transaction(async (tx) => {
      const newDeal = await tx.deal.create({
        data: {
          listingId,
          buyerId,
          sellerId,
          status: 'INQUIRY',
          agreedQuantity: quantity != null ? Number(quantity) : null,
        },
      })

      // First message in the deal thread
      await tx.message.create({
        data: {
          dealId: newDeal.id,
          senderId: buyerId,
          content: message.trim(),
          type: 'TEXT',
        },
      })

      // Notify the seller
      await tx.notification.create({
        data: {
          userId: sellerId,
          type: 'NEW_DEAL',
          title: 'New Deal Inquiry',
          titleAr: 'استفسار صفقة جديدة',
          body: `You have received a new deal inquiry for: ${listing.title}`,
          bodyAr: `لديك استفسار صفقة جديد على: ${listing.title}`,
          link: `/deals/${newDeal.id}`,
        },
      })

      // Notify the buyer (confirmation)
      await tx.notification.create({
        data: {
          userId: buyerId,
          type: 'NEW_DEAL',
          title: 'Deal Inquiry Sent',
          titleAr: 'تم إرسال الاستفسار',
          body: `Your inquiry for "${listing.title}" has been sent successfully.`,
          bodyAr: `تم إرسال استفسارك بنجاح على "${listing.title}".`,
          link: `/deals/${newDeal.id}`,
        },
      })

      return newDeal
    })

    return NextResponse.json({ success: true, deal }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/deals]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
