import { NextRequest } from 'next/server'
import { fetchLatest } from '@/data/providers/calendarProviders/tradingEconomics'
import { getCache, setCache } from '@/lib/cache'
import { CONFIG } from '@/lib/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from     = searchParams.get('from')     ?? undefined
  const to       = searchParams.get('to')       ?? undefined
  const country  = searchParams.get('country')  ?? undefined
  const impact   = searchParams.get('impact')   ?? undefined  // high|medium|low
  const ticker   = searchParams.get('ticker')   ?? undefined

  const cacheKey = `calendar:${from ?? ''}:${to ?? ''}:${country ?? ''}:${impact ?? ''}:${ticker ?? ''}`
  const cached = getCache<unknown>(cacheKey)
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800', 'X-Cache': 'HIT' },
    })
  }

  let events = await fetchLatest({ from, to, country })

  // Filter by impact
  if (impact && impact !== 'all') {
    events = events.filter(e => e.impact === impact)
  }

  // Filter by ticker relevance
  if (ticker) {
    const tickers = ticker.split(',').map(t => t.trim().toUpperCase())
    events = events.filter(e =>
      e.relatedTickers.some(t => tickers.includes(t))
    )
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const payload = { events, updatedAt: new Date().toISOString() }
  setCache(cacheKey, payload, CONFIG.cache.calendarTtl)

  return Response.json(payload, {
    headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800' },
  })
}
