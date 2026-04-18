import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      country: true, city: true, isVerified: true,
      kycStatus: true, createdAt: true,
      company: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}
