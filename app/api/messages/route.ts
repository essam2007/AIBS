import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_TYPES = ['TEXT', 'DOCUMENT', 'STATUS_UPDATE', 'SYSTEM'] as const

// ── POST /api/messages ────────────────────────────────────────────────────────
// Send a message to an existing deal thread
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json()
    const { dealId, content, type } = body

    // ── Validate inputs ───────────────────────────────────────────────────────
    if (!dealId || typeof dealId !== 'string') {
      return NextResponse.json({ error: 'dealId is required.' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 })
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Message content must not exceed 5000 characters.' },
        { status: 400 }
      )
    }

    const messageType = type ?? 'TEXT'
    if (!VALID_TYPES.includes(messageType)) {
      return NextResponse.json(
        { error: `Message type must be one of: ${VALID_TYPES.join(', ')}.` },
        { status: 400 }
      )
    }

    // ── Verify deal exists and user is a party ────────────────────────────────
    const deal = await db.deal.findUnique({
      where: { id: dealId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        brokerId: true,
        status: true,
        listing: { select: { title: true } },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
    }

    const userId = session.user.id
    const isParty =
      deal.buyerId === userId ||
      deal.sellerId === userId ||
      deal.brokerId === userId ||
      session.user.role === 'ADMIN'

    if (!isParty) {
      return NextResponse.json(
        { error: 'Forbidden: you are not a party to this deal.' },
        { status: 403 }
      )
    }

    // Disallow messaging on terminal deals
    if (deal.status === 'CLOSED' || deal.status === 'FAILED') {
      return NextResponse.json(
        { error: 'Cannot send messages on a closed or failed deal.' },
        { status: 409 }
      )
    }

    // ── Create message and notify other parties ────────────────────────────────
    const result = await db.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          dealId,
          senderId: userId,
          content: content.trim(),
          type: messageType,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              role: true,
            },
          },
        },
      })

      // Notify all other parties in the deal
      const recipientIds = [deal.buyerId, deal.sellerId, deal.brokerId].filter(
        (uid): uid is string => !!uid && uid !== userId
      )

      if (recipientIds.length > 0) {
        const notifications = recipientIds.map((recipientId) => ({
          userId: recipientId,
          type: 'MESSAGE' as const,
          title: 'New Message',
          titleAr: 'رسالة جديدة',
          body: `You have a new message in the deal for "${deal.listing.title}".`,
          bodyAr: `لديك رسالة جديدة في صفقة "${deal.listing.title}".`,
          link: `/deals/${dealId}`,
        }))

        await tx.notification.createMany({ data: notifications })
      }

      return message
    })

    return NextResponse.json({ success: true, message: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/messages]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
