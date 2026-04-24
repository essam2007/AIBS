import type { OilMetric } from '@/lib/types'
import { CONFIG } from '@/lib/config'

interface EIASeries {
  series_id: string
  name: string
  units: string
  data: Array<[string, number | null]>  // [period, value]
}

export async function fetchEIAInventory(): Promise<OilMetric[]> {
  if (!CONFIG.eia.apiKey) return getMockOilMetrics()

  try {
    // EIA v2 API: weekly petroleum inventory
    const seriesIds = [
      'PET.WCRSTUS1.W',  // US crude oil stocks
      'PET.WDISTUS1.W',  // Distillate fuel oil stocks
      'PET.WGFSTUS1.W',  // Gasoline stocks
    ]
    const results = await Promise.allSettled(
      seriesIds.map(id => fetchEIASeries(id))
    )
    const metrics: OilMetric[] = []
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) metrics.push(r.value)
    }
    return metrics.length > 0 ? metrics : getMockOilMetrics()
  } catch {
    return getMockOilMetrics()
  }
}

async function fetchEIASeries(seriesId: string): Promise<OilMetric | null> {
  const url = `${CONFIG.eia.baseUrl}/seriesid/${seriesId}?api_key=${CONFIG.eia.apiKey}&length=90&out=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const json = await res.json() as { response?: { data?: EIASeries[] } }
  const series = json.response?.data?.[0]
  if (!series?.data?.length) return null
  return normalize(series)
}

function normalize(series: EIASeries): OilMetric {
  const sorted = [...series.data].filter(([, v]) => v != null).reverse()
  const latest   = sorted[0]?.[1] ?? 0
  const prev7    = sorted[6]?.[1] ?? latest
  const prev30   = sorted[25]?.[1] ?? latest
  const prev90   = sorted[sorted.length - 1]?.[1] ?? latest

  return {
    symbol:        series.series_id,
    name:          series.name,
    price:         latest,
    change:        latest - (sorted[1]?.[1] ?? latest),
    changePercent: sorted[1]?.[1] ? ((latest - sorted[1][1]) / sorted[1][1]) * 100 : 0,
    unit:          series.units,
    timestamp:     new Date().toISOString(),
    rolling7d:     ((latest - prev7) / prev7) * 100,
    rolling30d:    ((latest - prev30) / prev30) * 100,
    rolling90d:    ((latest - prev90) / prev90) * 100,
  }
}

export function getMockOilMetrics(): OilMetric[] {
  return [
    {
      symbol: 'EIA-CRUDE-STOCKS', name: 'US Crude Oil Inventories',
      price: 439.2, change: -3.1, changePercent: -0.70,
      unit: 'million barrels',
      timestamp: new Date().toISOString(),
      rolling7d: -0.70, rolling30d: -2.14, rolling90d: -5.32,
    },
    {
      symbol: 'EIA-GASOLINE-STOCKS', name: 'US Gasoline Inventories',
      price: 224.8, change: -1.4, changePercent: -0.62,
      unit: 'million barrels',
      timestamp: new Date().toISOString(),
      rolling7d: -0.62, rolling30d: -1.89, rolling90d: 3.21,
    },
    {
      symbol: 'EIA-DISTILLATE-STOCKS', name: 'US Distillate Inventories',
      price: 118.4, change: +0.9, changePercent: +0.76,
      unit: 'million barrels',
      timestamp: new Date().toISOString(),
      rolling7d: 0.76, rolling30d: -4.20, rolling90d: -8.45,
    },
  ]
}
