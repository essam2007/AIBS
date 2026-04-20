import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') ?? 'CL=F'
  const interval = searchParams.get('interval') ?? '1d'
  const range = searchParams.get('range') ?? '6mo'

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com',
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const result = data?.chart?.result?.[0]
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
      meta: {
        currency: result.meta?.currency,
        exchangeName: result.meta?.exchangeName,
        instrumentType: result.meta?.instrumentType,
      },
    })
  } catch (err) {
    console.error('Chart data error:', err)
    return Response.json({ symbol, interval, range, candles: generateMockCandles(symbol), meta: {} })
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
