import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_SYMBOLS = [
  'CL=F',    // WTI Crude
  'BZ=F',    // Brent Crude
  'NG=F',    // Natural Gas
  'GC=F',    // Gold
  'SI=F',    // Silver
  '^GSPC',   // S&P 500
  '^IXIC',   // NASDAQ
  '^DJI',    // Dow Jones
  'BTC-USD', // Bitcoin
  'ETH-USD', // Ethereum
  'DX=F',    // US Dollar Index
  '^VIX',    // VIX
]

async function tryYahoo(symbols: string[]): Promise<unknown[] | null> {
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']
  for (const host of hosts) {
    try {
      const url = `https://${host}/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}&fields=symbol,shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
          'Accept': 'application/json,text/javascript,*/*;q=0.01',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com',
        },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      if (!res.ok) continue
      const data = await res.json()
      const quotes = data?.quoteResponse?.result
      if (Array.isArray(quotes) && quotes.length > 0) return quotes
    } catch {
      continue
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols')?.split(',') ?? DEFAULT_SYMBOLS

  const quotes = await tryYahoo(symbols)

  if (quotes) {
    const formatted = quotes.map((raw) => {
      const q = raw as Record<string, unknown>
      return {
        symbol: q.symbol,
        name: q.shortName ?? q.symbol,
        price: typeof q.regularMarketPrice === 'number' ? q.regularMarketPrice : null,
        change: typeof q.regularMarketChange === 'number' ? q.regularMarketChange : null,
        changePercent: typeof q.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : null,
        prevClose: q.regularMarketPreviousClose,
        open: q.regularMarketOpen,
        high: q.regularMarketDayHigh,
        low: q.regularMarketDayLow,
        volume: q.regularMarketVolume,
        marketCap: q.marketCap,
        week52High: q.fiftyTwoWeekHigh,
        week52Low: q.fiftyTwoWeekLow,
      }
    })
    return Response.json(
      { quotes: formatted, updatedAt: new Date().toISOString(), source: 'yahoo' },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
    )
  }

  // Fallback: mock data with slight random variation so UI feels live
  return Response.json(
    { quotes: getMockData(symbols), updatedAt: new Date().toISOString(), source: 'fallback' },
    { headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' } }
  )
}

function getMockData(symbols: string[]) {
  const MOCK: Record<string, { name: string; price: number; change: number; changePercent: number }> = {
    'CL=F':    { name: 'WTI Crude Oil', price: 87.43, change: 5.63, changePercent: 6.88 },
    'BZ=F':    { name: 'Brent Crude', price: 91.22, change: 5.18, changePercent: 6.03 },
    'NG=F':    { name: 'Natural Gas', price: 2.14, change: -0.08, changePercent: -3.60 },
    'GC=F':    { name: 'Gold', price: 3342.40, change: 28.50, changePercent: 0.86 },
    'SI=F':    { name: 'Silver', price: 32.18, change: -0.45, changePercent: -1.38 },
    '^GSPC':   { name: 'S&P 500', price: 5623.45, change: 24.18, changePercent: 0.43 },
    '^IXIC':   { name: 'NASDAQ', price: 17854.20, change: 118.40, changePercent: 0.67 },
    '^DJI':    { name: 'Dow Jones', price: 40123.55, change: 198.20, changePercent: 0.50 },
    'BTC-USD': { name: 'Bitcoin', price: 73922.88, change: -1876.08, changePercent: -2.48 },
    'ETH-USD': { name: 'Ethereum', price: 2268.63, change: -84.20, changePercent: -3.58 },
    'DX=F':    { name: 'US Dollar', price: 99.82, change: 0.34, changePercent: 0.34 },
    '^VIX':    { name: 'VIX', price: 17.48, change: -0.46, changePercent: -2.56 },
  }

  return symbols.map(sym => {
    const base = MOCK[sym]
    // Slight time-based variation so the ticker feels alive even on fallback
    const t = Date.now() / 60000
    const wobble = Math.sin(t + sym.length) * (base?.price ?? 100) * 0.001
    const price = (base?.price ?? 100) + wobble
    return {
      symbol: sym,
      name: base?.name ?? sym,
      price,
      change: base?.change ?? 0,
      changePercent: base?.changePercent ?? 0,
      prevClose: null, open: null, high: null, low: null,
      volume: null, marketCap: null, week52High: null, week52Low: null,
    }
  })
}
