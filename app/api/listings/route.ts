import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_TYPES = ['CRUDE_OIL', 'FUEL_OIL', 'GASOIL', 'JET_A1', 'LPG', 'BITUMEN', 'NAPHTHA']
const VALID_SIDES = ['BUY', 'SELL']
const VALID_INCOTERMS = ['FOB', 'CIF', 'CFR', 'DDP']
const VALID_PRICE_TYPES = ['FIXED', 'PLATTS_PLUS', 'ARGUS_PLUS', 'NEGOTIABLE']
const PAGE_SIZE = 20

// ── GET /api/listings ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const type = searchParams.get('type') ?? undefined
    const origin = searchParams.get('origin') ?? undefined
    const side = searchParams.get('side') ?? undefined
    const query = searchParams.get('q') ?? undefined
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const status = searchParams.get('status') ?? 'ACTIVE'

    const where: Record<string, unknown> = {
      status,
      ...(type ? { type } : {}),
      ...(origin ? { origin } : {}),
      ...(side ? { side } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { titleAr: { contains: query } },
              { origin: { contains: query } },
              { grade: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    }

    const [total, listings] = await Promise.all([
      db.listing.count({ where }),
      db.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              role: true,
              country: true,
              isVerified: true,
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
          company: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              isVerified: true,
              country: true,
            },
          },
          _count: { select: { deals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    })
  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── POST /api/listings ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      titleAr,
      type,
      side,
      origin,
      grade,
      refinery,
      quantity,
      quantityUnit,
      minQuantity,
      incoterms,
      loadingPort,
      deliveryPort,
      deliveryStart,
      deliveryEnd,
      vesselType,
      priceType,
      priceValue,
      priceBasis,
      currency,
      apiGravity,
      sulfurContent,
      viscosity,
      waterContent,
      ashContent,
      pourPoint,
      flashPoint,
      rvp,
      h2sContent,
      totalAcidNumber,
      waxContent,
      niContent,
      vaContent,
      description,
      descriptionAr,
      notes,
      expiresAt,
    } = body

    // ── Field validation ──────────────────────────────────────────────────────
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters.' },
        { status: 400 }
      )
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${VALID_TYPES.join(', ')}.` },
        { status: 400 }
      )
    }

    if (!side || !VALID_SIDES.includes(side)) {
      return NextResponse.json(
        { error: 'Side must be BUY or SELL.' },
        { status: 400 }
      )
    }

    if (!origin || typeof origin !== 'string' || origin.trim().length < 2) {
      return NextResponse.json({ error: 'Origin country is required.' }, { status: 400 })
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number.' }, { status: 400 })
    }

    if (!incoterms || !VALID_INCOTERMS.includes(incoterms)) {
      return NextResponse.json(
        { error: `Incoterms must be one of: ${VALID_INCOTERMS.join(', ')}.` },
        { status: 400 }
      )
    }

    if (priceType && !VALID_PRICE_TYPES.includes(priceType)) {
      return NextResponse.json(
        { error: `Price type must be one of: ${VALID_PRICE_TYPES.join(', ')}.` },
        { status: 400 }
      )
    }

    const listing = await db.listing.create({
      data: {
        title: title.trim(),
        titleAr: titleAr ?? null,
        type,
        side,
        origin: origin.trim(),
        grade: grade ?? null,
        refinery: refinery ?? null,
        quantity: Number(quantity),
        quantityUnit: quantityUnit ?? 'BBL',
        minQuantity: minQuantity != null ? Number(minQuantity) : null,
        incoterms,
        loadingPort: loadingPort ?? null,
        deliveryPort: deliveryPort ?? null,
        deliveryStart: deliveryStart ? new Date(deliveryStart) : null,
        deliveryEnd: deliveryEnd ? new Date(deliveryEnd) : null,
        vesselType: vesselType ?? null,
        priceType: priceType ?? 'NEGOTIABLE',
        priceValue: priceValue != null ? Number(priceValue) : null,
        priceBasis: priceBasis ?? null,
        currency: currency ?? 'USD',
        apiGravity: apiGravity != null ? Number(apiGravity) : null,
        sulfurContent: sulfurContent != null ? Number(sulfurContent) : null,
        viscosity: viscosity != null ? Number(viscosity) : null,
        waterContent: waterContent != null ? Number(waterContent) : null,
        ashContent: ashContent != null ? Number(ashContent) : null,
        pourPoint: pourPoint != null ? Number(pourPoint) : null,
        flashPoint: flashPoint != null ? Number(flashPoint) : null,
        rvp: rvp != null ? Number(rvp) : null,
        h2sContent: h2sContent != null ? Number(h2sContent) : null,
        totalAcidNumber: totalAcidNumber != null ? Number(totalAcidNumber) : null,
        waxContent: waxContent != null ? Number(waxContent) : null,
        niContent: niContent != null ? Number(niContent) : null,
        vaContent: vaContent != null ? Number(vaContent) : null,
        description: description ?? null,
        descriptionAr: descriptionAr ?? null,
        notes: notes ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: session.user.id,
        companyId: session.user.companyId ?? null,
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
