import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ── GET /api/profile ──────────────────────────────────────────────────────────
// Returns the authenticated user's full profile (no password)
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        whatsapp: true,
        country: true,
        city: true,
        isVerified: true,
        isActive: true,
        kycStatus: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            registrationNo: true,
            country: true,
            city: true,
            address: true,
            type: true,
            website: true,
            logo: true,
            isVerified: true,
            verifiedAt: true,
            dmccMember: true,
            description: true,
            descriptionAr: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            listings: true,
            buyerDeals: true,
            sellerDeals: true,
            brokerDeals: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── PATCH /api/profile ────────────────────────────────────────────────────────
// Update mutable profile fields for the authenticated user
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, nameAr, phone, whatsapp, city, country } = body

    // ── Validate updatable fields ─────────────────────────────────────────────
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters.' },
          { status: 400 }
        )
      }
    }

    if (nameAr !== undefined && nameAr !== null) {
      if (typeof nameAr !== 'string') {
        return NextResponse.json({ error: 'nameAr must be a string.' }, { status: 400 })
      }
    }

    if (phone !== undefined && phone !== null) {
      if (typeof phone !== 'string') {
        return NextResponse.json({ error: 'phone must be a string.' }, { status: 400 })
      }
    }

    if (whatsapp !== undefined && whatsapp !== null) {
      if (typeof whatsapp !== 'string') {
        return NextResponse.json({ error: 'whatsapp must be a string.' }, { status: 400 })
      }
    }

    if (city !== undefined && city !== null) {
      if (typeof city !== 'string') {
        return NextResponse.json({ error: 'city must be a string.' }, { status: 400 })
      }
    }

    if (country !== undefined) {
      if (typeof country !== 'string' || country.trim().length < 2) {
        return NextResponse.json(
          { error: 'country must be a valid string.' },
          { status: 400 }
        )
      }
    }

    // Build the update payload with only supplied fields
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name.trim()
    if (nameAr !== undefined) data.nameAr = nameAr
    if (phone !== undefined) data.phone = phone
    if (whatsapp !== undefined) data.whatsapp = whatsapp
    if (city !== undefined) data.city = city
    if (country !== undefined) data.country = country.trim()

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        whatsapp: true,
        country: true,
        city: true,
        isVerified: true,
        isActive: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error('[PATCH /api/profile]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
