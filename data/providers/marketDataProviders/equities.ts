import type { OilMetric } from '@/lib/types'

const ENERGY_EQUITIES = ['XOM', 'CVX', 'COP', 'SHEL', 'BP', 'EOG', 'SLB', 'HAL', 'XLE', 'OIH']

async function tryYahoo(symbols: string[]): Promise<unknown[] | null> {
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']
  for (const host of hosts) {
    try {
      const url = `https://${host}/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 OilDesk/2.0',
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com/',
        },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      if (!res.ok) continue
      const data = await res.json()
      const quotes = data?.quoteResponse?.result
      if (Array.isArray(quotes) && quotes.length > 0) return quotes
    } catch { continue }
  }
  return null
}

export async function fetchEnergyEquities(): Promise<OilMetric[]> {
  const raw = await tryYahoo(ENERGY_EQUITIES)
  if (!raw) return getMockEquities()

  return (raw as Record<string, unknown>[]).map(q => ({
    symbol:        q.symbol as string,
    name:          (q.shortName ?? q.symbol) as string,
    price:         (q.regularMarketPrice ?? 0) as number,
    change:        (q.regularMarketChange ?? 0) as number,
    changePercent: (q.regularMarketChangePercent ?? 0) as number,
    unit:          'USD',
    timestamp:     new Date().toISOString(),
  }))
}

function getMockEquities(): OilMetric[] {
  const BASE: Record<string, { name: string; price: number; chg: number; pct: number }> = {
    'XOM':  { name: 'Exxon Mobil',     price: 118.42, chg:  2.18, pct:  1.87 },
    'CVX':  { name: 'Chevron',         price: 162.83, chg:  2.94, pct:  1.84 },
    'COP':  { name: 'ConocoPhillips',  price: 123.17, chg:  1.82, pct:  1.50 },
    'SHEL': { name: 'Shell PLC',       price:  68.92, chg:  0.84, pct:  1.23 },
    'BP':   { name: 'BP PLC',          price:  34.18, chg:  0.42, pct:  1.24 },
    'EOG':  { name: 'EOG Resources',   price: 134.56, chg:  1.96, pct:  1.48 },
    'SLB':  { name: 'Schlumberger',    price:  48.32, chg:  0.68, pct:  1.43 },
    'HAL':  { name: 'Halliburton',     price:  36.88, chg:  0.52, pct:  1.43 },
    'XLE':  { name: 'Energy Select ETF', price: 94.12, chg: 1.34, pct:  1.44 },
    'OIH':  { name: 'VanEck Oil Svc ETF', price: 38.24, chg: 0.56, pct: 1.49 },
  }
  return ENERGY_EQUITIES.map(s => ({
    symbol: s, name: BASE[s]?.name ?? s,
    price: BASE[s]?.price ?? 100,
    change: BASE[s]?.chg ?? 0,
    changePercent: BASE[s]?.pct ?? 0,
    unit: 'USD', timestamp: new Date().toISOString(),
  }))
}
