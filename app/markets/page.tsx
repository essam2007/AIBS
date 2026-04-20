'use client'

import useSWR from 'swr'
import { useState } from 'react'
import PriceCard from '@/components/market/PriceCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Quote {
  symbol: string; name: string; price: number | null
  change: number | null; changePercent: number | null
  high: number | null; low: number | null
  volume: number | null; week52High: number | null; week52Low: number | null
}

const CATEGORIES = {
  energy: {
    label: 'Energy',
    symbols: ['CL=F', 'BZ=F', 'NG=F', 'HO=F', 'RB=F'],
    color: '#00d4aa',
  },
  indices: {
    label: 'Indices',
    symbols: ['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX'],
    color: '#3b82f6',
  },
  metals: {
    label: 'Metals',
    symbols: ['GC=F', 'SI=F', 'PL=F', 'HG=F'],
    color: '#f59e0b',
  },
  crypto: {
    label: 'Crypto',
    symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD'],
    color: '#8b5cf6',
  },
  fx: {
    label: 'FX',
    symbols: ['DX=F', 'EURUSD=X', 'GBPUSD=X', 'USDJPY=X'],
    color: '#ec4899',
  },
}

const ALL_SYMBOLS = Object.values(CATEGORIES).flatMap(c => c.symbols)

function formatVolume(v: number | null): string {
  if (v == null) return '—'
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return v.toString()
}

function formatPrice(p: number | null): string {
  if (p == null) return '—'
  if (p > 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (p > 100) return p.toFixed(2)
  return p.toFixed(4)
}

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof CATEGORIES>('energy')
  const [view, setView] = useState<'cards' | 'table'>('table')

  const cat = CATEGORIES[activeTab]
  const { data, isLoading } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${ALL_SYMBOLS.join(',')}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const allQuotes = data?.quotes ?? []
  const filtered = allQuotes.filter(q => cat.symbols.includes(q.symbol))
  const loaders = cat.symbols.map(s => ({ symbol: s, name: s, price: null, change: null, changePercent: null, high: null, low: null, volume: null, week52High: null, week52Low: null }))
  const displayed = filtered.length > 0 ? filtered : loaders

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>Live Markets</h1>
          <p style={{ fontSize: 13, color: '#55556a' }}>Real-time quotes via Yahoo Finance · Updates every 30s</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setView('table')} className={`tab-btn${view === 'table' ? ' active' : ''}`}>Table</button>
          <button onClick={() => setView('cards')} className={`tab-btn${view === 'cards' ? ' active' : ''}`}>Cards</button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.055)', paddingBottom: 12 }}>
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as keyof typeof CATEGORIES)}
            className={`tab-btn${activeTab === key ? ' active' : ''}`}
            style={{ fontSize: 13 }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Market summary cards - top movers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Gainers', value: allQuotes.filter(q => (q.changePercent ?? 0) > 0).length, color: '#22c55e', icon: '↑' },
          { label: 'Losers', value: allQuotes.filter(q => (q.changePercent ?? 0) < 0).length, color: '#ef4444', icon: '↓' },
          { label: 'Unchanged', value: allQuotes.filter(q => (q.changePercent ?? 0) === 0).length, color: '#8888a8', icon: '—' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 22, color: s.color, fontWeight: 700 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#eeeef5' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#55556a' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      {view === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {displayed.map(q => (
            <PriceCard
              key={q.symbol}
              symbol={q.symbol}
              name={q.name}
              price={q.price}
              change={q.change}
              changePercent={q.changePercent}
              highlight={['CL=F', 'BZ=F'].includes(q.symbol)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 1fr 1fr 1fr 1fr',
            gap: 0,
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {['Symbol', 'Price', 'Change', '% Change', 'Volume', '52W Range'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#55556a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {displayed.map((q, i) => {
            const up = (q.changePercent ?? 0) >= 0
            return (
              <div
                key={q.symbol}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 1fr 1fr 1fr 1fr',
                  gap: 0,
                  padding: '14px 20px',
                  borderBottom: i < displayed.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                  alignItems: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5' }}>{q.symbol}</div>
                  <div style={{ fontSize: 11, color: '#55556a' }}>{q.name}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                  {q.price != null ? formatPrice(q.price) : <span className="skeleton" style={{ width: 60, height: 14, display: 'block' }} />}
                </div>
                <div style={{ fontSize: 13, color: up ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                  {q.change != null ? `${up ? '+' : ''}${formatPrice(q.change)}` : '—'}
                </div>
                <div>
                  {q.changePercent != null ? (
                    <span
                      className={up ? 'bg-up' : 'bg-down'}
                      style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {up ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </span>
                  ) : <span className="skeleton" style={{ width: 60, height: 20, borderRadius: 20, display: 'block' }} />}
                </div>
                <div style={{ fontSize: 12, color: '#8888a8', fontVariantNumeric: 'tabular-nums' }}>
                  {formatVolume(q.volume)}
                </div>
                <div style={{ fontSize: 11, color: '#55556a' }}>
                  {q.week52Low != null && q.week52High != null
                    ? `${formatPrice(q.week52Low)} — ${formatPrice(q.week52High)}`
                    : '—'
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
