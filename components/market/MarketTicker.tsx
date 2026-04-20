'use client'

import useSWR from 'swr'

interface Quote {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const TICKER_SYMBOLS = ['CL=F', 'BZ=F', 'GC=F', '^GSPC', '^IXIC', 'BTC-USD', 'ETH-USD', 'NG=F', 'SI=F', '^VIX', 'DX=F']

const DISPLAY_NAMES: Record<string, string> = {
  'CL=F': 'WTI CRUDE',
  'BZ=F': 'BRENT',
  'GC=F': 'GOLD',
  '^GSPC': 'S&P 500',
  '^IXIC': 'NASDAQ',
  'BTC-USD': 'BTC',
  'ETH-USD': 'ETH',
  'NG=F': 'NAT GAS',
  'SI=F': 'SILVER',
  '^VIX': 'VIX',
  'DX=F': 'USD IDX',
}

function fmt(price: number | null, sym: string): string {
  if (price == null) return '—'
  if (sym === 'BTC-USD') return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (sym === '^GSPC' || sym === '^IXIC' || sym === '^DJI') return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (sym === 'GC=F') return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return price.toFixed(2)
}

export default function MarketTicker() {
  const { data } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${TICKER_SYMBOLS.join(',')}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const quotes: Quote[] = data?.quotes ?? TICKER_SYMBOLS.map(s => ({
    symbol: s, name: DISPLAY_NAMES[s] ?? s, price: null, change: null, changePercent: null,
  }))

  const items = [...quotes, ...quotes] // duplicate for seamless loop

  return (
    <div
      style={{
        height: 38,
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 60,
        background: 'linear-gradient(to right, rgba(7,7,14,1), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 60,
        background: 'linear-gradient(to left, rgba(7,7,14,1), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div
        className="ticker-run"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          gap: 0,
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {items.map((q, idx) => {
          const up = (q.changePercent ?? 0) >= 0
          return (
            <div
              key={`${q.symbol}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 20px',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                height: '100%',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              title={q.name}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#55556a', letterSpacing: '0.06em' }}>
                {DISPLAY_NAMES[q.symbol] ?? q.symbol}
              </span>
              {q.price != null ? (
                <>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(q.price, q.symbol)}
                  </span>
                  <span style={{ fontSize: 10, color: up ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                    {up ? '▲' : '▼'} {Math.abs(q.changePercent ?? 0).toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="skeleton" style={{ width: 60, height: 12 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
