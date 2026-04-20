import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function tryYahooChart(symbol: string, interval: string, range: string) {
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']
  for (const host of hosts) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
          'Accept': 'application/json,text/javascript,*/*;q=0.01',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
        },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      if (!res.ok) continue
      const data = await res.json()
      const result = data?.chart?.result?.[0]
      if (result) return result
    } catch {
      continue
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') ?? 'CL=F'
  const interval = searchParams.get('interval') ?? '1d'
  const range = searchParams.get('range') ?? '6mo'

  try {
    const result = await tryYahooChart(symbol, interval, range)
    if (!result) throw new Error('No data')

    const timestamps: number[] = result.timestamp ?? []
    const quote = result.indicators?.quote?.[0] ?? {}
    const opens: (number | null)[] = quote.open ?? []
    const highs: (number | null)[] = quote.high ?? []
    const lows: (number | null)[] = quote.low ?? []
    const closes: (number | null)[] = quote.close ?? []
    const volumes: (number | null)[] = quote.volume ?? []

    const candles = timestamps
      .map((ts, i) => ({
        time: Math.floor(ts) as number,
        open: opens[i],
        high: highs[i],
        low: lows[i],
        close: closes[i],
        volume: volumes[i],
      }))
      .filter(c => c.open != null && c.high != null && c.low != null && c.close != null)

    return Response.json({
      symbol,
      interval,
      range,
      candles,
      source: 'yahoo',
      meta: {
        currency: result.meta?.currency,
        exchangeName: result.meta?.exchangeName,
        instrumentType: result.meta?.instrumentType,
      },
    }, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
  } catch (err) {
    console.error('Chart data error:', err)
    return Response.json(
      { symbol, interval, range, candles: generateMockCandles(symbol), source: 'fallback', meta: {} },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
    )
  }
}

function generateMockCandles(symbol: string) {
  const BASE_PRICES: Record<string, number> = {
    'CL=F': 82, 'BZ=F': 86, 'GC=F': 3280, 'SI=F': 31,
    '^GSPC': 5400, '^IXIC': 17200, 'BTC-USD': 68000, 'ETH-USD': 2100,
  }
  const base = BASE_PRICES[symbol] ?? 100
  const candles = []
  const now = Math.floor(Date.now() / 1000)
  let price = base

  for (let i = 179; i >= 0; i--) {
    const t = now - i * 86400
    const change = (Math.random() - 0.48) * base * 0.02
    const open = price
    price = Math.max(price + change, base * 0.7)
    const hi = Math.max(open, price) * (1 + Math.random() * 0.008)
    const lo = Math.min(open, price) * (1 - Math.random() * 0.008)
    candles.push({ time: t, open, high: hi, low: lo, close: price, volume: Math.floor(Math.random() * 500000 + 100000) })
  }
  return candles
}
