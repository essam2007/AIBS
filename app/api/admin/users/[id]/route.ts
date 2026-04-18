import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { isVerified, kycStatus } = body

  const user = await db.user.update({
    where: { id },
    data: { isVerified, kycStatus },
    select: { id: true, isVerified: true, kycStatus: true },
  })

  return NextResponse.json(user)
}
