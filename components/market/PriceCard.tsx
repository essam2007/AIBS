'use client'

interface PriceCardProps {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  unit?: string
  subtitle?: string
  highlight?: boolean
  onClick?: () => void
  sparkline?: number[]
}

function MiniChart({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80
  const h = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={up ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  )
}

function fmt(price: number | null, symbol: string): string {
  if (price == null) return '—'
  if (['BTC-USD', 'ETH-USD'].includes(symbol)) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (['^GSPC', '^IXIC', '^DJI'].includes(symbol)) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (['GC=F'].includes(symbol)) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (['CL=F', 'BZ=F'].includes(symbol)) return `$${price.toFixed(2)}`
  return price.toFixed(2)
}

export default function PriceCard({
  symbol, name, price, change, changePercent,
  unit, subtitle, highlight, onClick, sparkline,
}: PriceCardProps) {
  const up = (changePercent ?? 0) >= 0
  const pct = Math.abs(changePercent ?? 0)
  const chg = Math.abs(change ?? 0)

  return (
    <div
      onClick={onClick}
      style={{
        background: highlight
          ? 'rgba(0,212,170,0.04)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${highlight ? 'rgba(0,212,170,0.18)' : 'rgba(255,255,255,0.055)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
      }}
      onMouseEnter={e => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = highlight
            ? 'rgba(0,212,170,0.35)'
            : 'rgba(255,255,255,0.1)'
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = highlight
            ? 'rgba(0,212,170,0.18)'
            : 'rgba(255,255,255,0.055)'
        }
      }}
    >
      {/* Symbol row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#55556a', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {symbol}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#eeeef5', marginTop: 1 }}>
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: 10, color: '#55556a', marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
        {sparkline && <MiniChart data={sparkline} up={up} />}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {price != null ? (
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#eeeef5',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {fmt(price, symbol)}{unit && <span style={{ fontSize: 13, color: '#8888a8', marginLeft: 3 }}>{unit}</span>}
            </div>
          ) : (
            <span className="skeleton" style={{ width: 80, height: 22, display: 'block' }} />
          )}
        </div>

        {changePercent != null ? (
          <div
            className={up ? 'bg-up' : 'bg-down'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>{up ? '▲' : '▼'}</span>
            <span>{pct.toFixed(2)}%</span>
          </div>
        ) : (
          <span className="skeleton" style={{ width: 60, height: 20, borderRadius: 20, display: 'block' }} />
        )}
      </div>

      {/* Change in absolute */}
      {change != null && (
        <div style={{ fontSize: 11, color: up ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
          {up ? '+' : '-'}{fmt(chg, symbol)} today
        </div>
      )}
    </div>
  )
}
