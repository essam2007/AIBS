import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type RouteParams = { params: Promise<{ id: string }> }

// ── GET /api/listings/[id] ────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            role: true,
            phone: true,
            country: true,
            isVerified: true,
            image: true,
            company: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                isVerified: true,
                country: true,
                website: true,
                logo: true,
              },
            },
          },
        },
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
            description: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { deals: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (err) {
    console.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── PATCH /api/listings/[id] ──────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.listing.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    const isOwner = existing.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: you do not own this listing.' }, { status: 403 })
    }

    const body = await req.json()

    // Build a safe update payload — only pick known, settable fields
    const allowedFields = [
      'title', 'titleAr', 'type', 'side', 'origin', 'grade', 'refinery',
      'quantity', 'quantityUnit', 'minQuantity', 'incoterms', 'loadingPort',
      'deliveryPort', 'deliveryStart', 'deliveryEnd', 'vesselType',
      'priceType', 'priceValue', 'priceBasis', 'currency',
      'apiGravity', 'sulfurContent', 'viscosity', 'waterContent', 'ashContent',
      'pourPoint', 'flashPoint', 'rvp', 'h2sContent', 'totalAcidNumber',
      'waxContent', 'niContent', 'vaContent',
      'description', 'descriptionAr', 'notes', 'expiresAt', 'status',
    ] as const

    const dateFields = new Set(['deliveryStart', 'deliveryEnd', 'expiresAt'])
    const numericFields = new Set([
      'quantity', 'minQuantity', 'priceValue',
      'apiGravity', 'sulfurContent', 'viscosity', 'waterContent', 'ashContent',
      'pourPoint', 'flashPoint', 'rvp', 'h2sContent', 'totalAcidNumber',
      'waxContent', 'niContent', 'vaContent',
    ])

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        const val = body[field]
        if (dateFields.has(field)) {
          data[field] = val ? new Date(val) : null
        } else if (numericFields.has(field)) {
          data[field] = val != null ? Number(val) : null
        } else {
          data[field] = val
        }
      }
    }

    const updated = await db.listing.update({
      where: { id },
      data,
    })

    return NextResponse.json({ listing: updated })
  } catch (err) {
    console.error('[PATCH /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── DELETE /api/listings/[id] — soft delete (set status CLOSED) ───────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.listing.findUnique({ where: { id }, select: { userId: true, status: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    const isOwner = existing.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: you do not own this listing.' }, { status: 403 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { status: 'CLOSED' },
      select: { id: true, status: true },
    })

    return NextResponse.json({ success: true, listing: updated })
  } catch (err) {
    console.error('[DELETE /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
