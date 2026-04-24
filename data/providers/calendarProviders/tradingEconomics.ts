import type { EconomicEvent } from '@/lib/types'
import { CONFIG } from '@/lib/config'

const TICKER_RELEVANCE: Record<string, string[]> = {
  'cpi':                     ['^GSPC', 'GC=F', 'DX=F'],
  'inflation':               ['^GSPC', 'GC=F', 'DX=F'],
  'gdp':                     ['^GSPC', '^IXIC', '^DJI'],
  'unemployment':            ['^GSPC', '^IXIC'],
  'oil inventories':         ['CL=F', 'BZ=F', 'XLE'],
  'crude oil inventory':     ['CL=F', 'BZ=F'],
  'eia crude':               ['CL=F', 'BZ=F', 'XLE'],
  'natural gas storage':     ['NG=F'],
  'gasoline inventory':      ['RB=F', 'CL=F'],
  'opec':                    ['CL=F', 'BZ=F', 'XLE'],
  'fed':                     ['^GSPC', '^IXIC', 'GC=F', 'DX=F'],
  'interest rate':           ['^GSPC', '^IXIC', 'GC=F', 'DX=F'],
  'fomc':                    ['^GSPC', '^IXIC', 'GC=F', 'DX=F'],
  'nonfarm payroll':         ['^GSPC', '^IXIC', 'DX=F'],
  'jobs':                    ['^GSPC', '^IXIC'],
  'pmi':                     ['^GSPC', 'CL=F'],
  'retail sales':            ['^GSPC', '^IXIC'],
  'trade balance':           ['DX=F', '^GSPC'],
}

function mapRelatedTickers(title: string): string[] {
  const lower = title.toLowerCase()
  const found = new Set<string>()
  for (const [kw, tickers] of Object.entries(TICKER_RELEVANCE)) {
    if (lower.includes(kw)) tickers.forEach(t => found.add(t))
  }
  return [...found].slice(0, 5)
}

interface TEEvent {
  Date: string
  Country: string
  Currency: string
  Category: string
  Event: string
  Reference?: string
  Source?: string
  Actual?: string
  Previous?: string
  Forecast?: string
  TEForecast?: string
  Importance: number  // 1=low, 2=medium, 3=high
}

function impactFromImportance(n: number): 'high' | 'medium' | 'low' {
  if (n >= 3) return 'high'
  if (n === 2) return 'medium'
  return 'low'
}

export async function fetchLatest(params?: {
  from?: string
  to?: string
  country?: string
}): Promise<EconomicEvent[]> {
  const apiKey = CONFIG.tradingEconomics.apiKey
  const from = params?.from ?? new Date().toISOString().slice(0, 10)
  const to   = params?.to   ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  if (!apiKey) return getMockCalendar()

  try {
    let url = `${CONFIG.tradingEconomics.baseUrl}/calendar/country/all/${from}/${to}?c=${apiKey}&f=json`
    if (params?.country) url += `&country=${encodeURIComponent(params.country)}`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return getMockCalendar()
    const data = await res.json() as TEEvent[]
    return data.map(normalize)
  } catch {
    return getMockCalendar()
  }
}

export function normalize(raw: TEEvent): EconomicEvent {
  return {
    id:             `te-${Buffer.from(raw.Event + raw.Date).toString('base64').slice(0, 16)}`,
    title:          raw.Event,
    country:        raw.Country,
    currency:       raw.Currency,
    date:           raw.Date,
    impact:         impactFromImportance(raw.Importance),
    actual:         raw.Actual,
    forecast:       raw.Forecast || raw.TEForecast,
    previous:       raw.Previous,
    relatedTickers: mapRelatedTickers(raw.Event),
    category:       raw.Category,
  }
}

function getMockCalendar(): EconomicEvent[] {
  const now = Date.now()
  const d = (offsetDays: number, hour = 14) =>
    new Date(now + offsetDays * 86400000).toISOString().replace(/T.*/, `T${String(hour).padStart(2, '0')}:30:00Z`)

  return [
    {
      id: 'mock-cal-1', title: 'EIA Crude Oil Inventories', country: 'United States',
      currency: 'USD', date: d(1, 14), impact: 'high',
      forecast: '-1.2M', previous: '+0.8M', unit: 'barrels',
      relatedTickers: ['CL=F', 'BZ=F', 'XLE'], category: 'Energy',
    },
    {
      id: 'mock-cal-2', title: 'US CPI (MoM)', country: 'United States',
      currency: 'USD', date: d(2, 12), impact: 'high',
      forecast: '0.3%', previous: '0.4%', unit: '%',
      relatedTickers: ['^GSPC', 'GC=F', 'DX=F'], category: 'Inflation',
    },
    {
      id: 'mock-cal-3', title: 'EIA Natural Gas Storage', country: 'United States',
      currency: 'USD', date: d(3, 14), impact: 'medium',
      forecast: '+38B', previous: '+52B', unit: 'bcf',
      relatedTickers: ['NG=F'], category: 'Energy',
    },
    {
      id: 'mock-cal-4', title: 'FOMC Meeting Minutes', country: 'United States',
      currency: 'USD', date: d(3, 18), impact: 'high',
      relatedTickers: ['^GSPC', '^IXIC', 'GC=F', 'DX=F'], category: 'Central Bank',
    },
    {
      id: 'mock-cal-5', title: 'US Nonfarm Payrolls', country: 'United States',
      currency: 'USD', date: d(4, 12), impact: 'high',
      forecast: '175K', previous: '189K', unit: 'K',
      relatedTickers: ['^GSPC', '^IXIC', 'DX=F'], category: 'Employment',
    },
    {
      id: 'mock-cal-6', title: 'EU CPI Flash Estimate', country: 'Euro Area',
      currency: 'EUR', date: d(2, 9), impact: 'high',
      forecast: '2.2%', previous: '2.4%', unit: '%',
      relatedTickers: ['^GSPC'], category: 'Inflation',
    },
    {
      id: 'mock-cal-7', title: 'Baker Hughes Rig Count', country: 'United States',
      currency: 'USD', date: d(4, 17), impact: 'medium',
      forecast: '487', previous: '490', unit: 'rigs',
      relatedTickers: ['CL=F', 'BZ=F'], category: 'Energy',
    },
    {
      id: 'mock-cal-8', title: 'API Weekly Crude Oil Stock', country: 'United States',
      currency: 'USD', date: d(0, 20), impact: 'medium',
      forecast: '-0.9M', previous: '+1.2M', unit: 'barrels',
      relatedTickers: ['CL=F', 'BZ=F', 'XLE'], category: 'Energy',
    },
  ]
}
