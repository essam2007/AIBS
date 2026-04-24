import { getCache, setCache } from '@/lib/cache'
import { fetchEIAInventory } from '@/data/providers/marketDataProviders/oil'
import { fetchEnergyEquities } from '@/data/providers/marketDataProviders/equities'
import { CONFIG } from '@/lib/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const cacheKey = 'energy:combined'
  const cached = getCache<unknown>(cacheKey)
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600', 'X-Cache': 'HIT' },
    })
  }

  const [inventory, equities] = await Promise.allSettled([
    fetchEIAInventory(),
    fetchEnergyEquities(),
  ])

  const payload = {
    inventory: inventory.status === 'fulfilled' ? inventory.value : [],
    equities:  equities.status === 'fulfilled'  ? equities.value  : [],
    updatedAt: new Date().toISOString(),
  }

  setCache(cacheKey, payload, CONFIG.cache.newsTtl)
  return Response.json(payload, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
