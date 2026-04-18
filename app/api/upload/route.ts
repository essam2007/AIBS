import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'OTHER'
    const dealId = formData.get('dealId') as string | null
    const listingId = formData.get('listingId') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const MAX_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const hash = createHash('sha256').update(buffer).digest('hex')

    // Store locally in public/uploads (dev) — swap for S3 in prod
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() ?? 'bin'
    const filename = `${Date.now()}-${hash.slice(0, 8)}.${ext}`
    await writeFile(join(uploadDir, filename), buffer)

    const doc = await db.document.create({
      data: {
        name: file.name,
        type,
        url: `/uploads/${filename}`,
        size: file.size,
        mimeType: file.type,
        hash,
        userId: session.user.id,
        ...(dealId ? { dealId } : {}),
        ...(listingId ? { listingId } : {}),
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
