import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const VALID_ROLES = ['BROKER', 'BUYER', 'SELLER', 'ADMIN'] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role, phone, country, companyName } = body

    // ── Validate required fields ──────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${VALID_ROLES.join(', ')}.` },
        { status: 400 }
      )
    }

    // ── Check email uniqueness ────────────────────────────────────────────────
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // ── Hash password ─────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10)

    // ── Create Company if companyName supplied ────────────────────────────────
    let companyId: string | undefined

    if (companyName && typeof companyName === 'string' && companyName.trim().length > 0) {
      const company = await db.company.create({
        data: {
          name: companyName.trim(),
          country: country ?? 'AE',
          type: role ?? 'BROKER',
        },
      })
      companyId = company.id
    }

    // ── Create User ───────────────────────────────────────────────────────────
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role ?? 'BROKER',
        phone: phone ?? null,
        country: country ?? 'AE',
        ...(companyId ? { companyId } : {}),
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/register]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
