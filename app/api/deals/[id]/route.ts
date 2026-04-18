import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type RouteParams = { params: Promise<{ id: string }> }

const VALID_STATUSES = [
  'INQUIRY',
  'LOI_SENT',
  'FCO_ISSUED',
  'NEGOTIATION',
  'SGS_PENDING',
  'DLC_PENDING',
  'CONTRACTED',
  'CLOSED',
  'FAILED',
] as const

// ── GET /api/deals/[id] ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    const deal = await db.deal.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            user: {
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
            company: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                isVerified: true,
                country: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true,
            country: true,
            isVerified: true,
            image: true,
            company: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                isVerified: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true,
            country: true,
            isVerified: true,
            image: true,
            company: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                isVerified: true,
              },
            },
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true,
            country: true,
            isVerified: true,
            image: true,
            company: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                isVerified: true,
              },
            },
          },
        },
        messages: {
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
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
    }

    // Only involved parties or admins may view a deal
    const userId = session.user.id
    const isParty =
      deal.buyerId === userId ||
      deal.sellerId === userId ||
      deal.brokerId === userId ||
      session.user.role === 'ADMIN'

    if (!isParty) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // Mark unread messages as read for this user
    await db.message.updateMany({
      where: {
        dealId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ deal })
  } catch (err) {
    console.error('[GET /api/deals/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── PATCH /api/deals/[id] ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.deal.findUnique({
      where: { id },
      select: {
        buyerId: true,
        sellerId: true,
        brokerId: true,
        status: true,
        listing: { select: { title: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
    }

    const userId = session.user.id
    const isParty =
      existing.buyerId === userId ||
      existing.sellerId === userId ||
      existing.brokerId === userId ||
      session.user.role === 'ADMIN'

    if (!isParty) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await req.json()
    const { status, notes, agreedPrice, agreedQuantity, agreedIncoterms, commissionPct } = body

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}.` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (agreedPrice != null) updateData.agreedPrice = Number(agreedPrice)
    if (agreedQuantity != null) updateData.agreedQuantity = Number(agreedQuantity)
    if (agreedIncoterms !== undefined) updateData.agreedIncoterms = agreedIncoterms
    if (commissionPct != null) updateData.commissionPct = Number(commissionPct)

    // Set closure timestamp when deal reaches terminal states
    if (status === 'CLOSED' || status === 'FAILED') {
      updateData.closedAt = new Date()
    }

    const updated = await db.$transaction(async (tx) => {
      const updatedDeal = await tx.deal.update({
        where: { id },
        data: updateData,
      })

      // Notify all involved parties of the status change
      if (status && status !== existing.status) {
        const notifyUserIds = [
          existing.buyerId,
          existing.sellerId,
          existing.brokerId,
        ].filter((uid): uid is string => !!uid && uid !== userId)

        const notifications = notifyUserIds.map((recipientId) => ({
          userId: recipientId,
          type: 'DEAL_UPDATE',
          title: 'Deal Status Updated',
          titleAr: 'تم تحديث حالة الصفقة',
          body: `Deal for "${existing.listing.title}" has been updated to: ${status}`,
          bodyAr: `تم تحديث صفقة "${existing.listing.title}" إلى: ${status}`,
          link: `/deals/${id}`,
        }))

        if (notifications.length > 0) {
          await tx.notification.createMany({ data: notifications })
        }
      }

      return updatedDeal
    })

    return NextResponse.json({ deal: updated })
  } catch (err) {
    console.error('[PATCH /api/deals/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
