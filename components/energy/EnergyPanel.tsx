'use client'

import useSWR from 'swr'
import dynamic from 'next/dynamic'
import type { OilMetric } from '@/lib/types'
import NewsFeed from '@/components/news/NewsFeed'
import Calendar from '@/components/calendar/Calendar'

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false })

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Quote { symbol: string; name: string; price: number | null; change: number | null; changePercent: number | null }

const OIL_SYMBOLS   = ['CL=F', 'BZ=F', 'NG=F', 'HO=F', 'RB=F']
const EQUITY_SYMBOLS = ['XOM', 'CVX', 'COP', 'SHEL', 'BP', 'XLE']

const REGIONAL_BENCHMARKS = [
  { name: 'WTI Crude',     flag: '🇺🇸', symbol: 'CL=F',  note: 'Americas' },
  { name: 'Brent Crude',   flag: '🌊',  symbol: 'BZ=F',  note: 'North Sea' },
  { name: 'Dubai Crude',   flag: '🇦🇪', price: 88.40,    note: 'Gulf Region', static: true },
  { name: 'Bonny Light',   flag: '🇳🇬', price: 92.10,    note: 'West Africa', static: true },
  { name: 'MOPS Crude',    flag: '🇸🇬', price: 89.80,    note: 'Asia Pacific', static: true },
]

const OPEC_DATA = [
  { country: 'Saudi Arabia', mbd: 9.0, quota: 9.0,  flag: '🇸🇦' },
  { country: 'Russia',       mbd: 9.2, quota: 9.5,  flag: '🇷🇺' },
  { country: 'UAE',          mbd: 3.2, quota: 3.2,  flag: '🇦🇪' },
  { country: 'Iraq',         mbd: 4.3, quota: 4.0,  flag: '🇮🇶' },
  { country: 'Kuwait',       mbd: 2.5, quota: 2.5,  flag: '🇰🇼' },
]

function pct(v: number | null): string {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}
function price(v: number | null, decimals = 2): string {
  if (v == null) return '—'
  return `$${v.toFixed(decimals)}`
}
function changeColor(v: number | null): string {
  if (v == null) return '#8888a8'
  return v >= 0 ? '#22c55e' : '#ef4444'
}

interface Props { compact?: boolean }

export default function EnergyPanel({ compact = false }: Props) {
  const { data: mktData } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${[...OIL_SYMBOLS, ...EQUITY_SYMBOLS].join(',')}`,
    fetcher,
    { refreshInterval: 30_000 }
  )
  const { data: energyData } = useSWR<{ inventory: OilMetric[]; equities: OilMetric[] }>(
    '/api/energy',
    fetcher,
    { refreshInterval: 300_000 }
  )

  const quotes  = mktData?.quotes ?? []
  const get     = (sym: string) => quotes.find(q => q.symbol === sym)

  const wti   = get('CL=F')
  const brent = get('BZ=F')
  const spread = (brent?.price ?? 0) - (wti?.price ?? 0)

  if (compact) return <CompactOilBar wti={wti} brent={brent} spread={spread} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(7,7,14,0) 60%)',
        border: '1px solid rgba(0,212,170,0.1)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 26 }}>🛢️</span>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5' }}>Oil Desk</h1>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.08em',
              background: 'rgba(34,197,94,0.12)', color: '#22c55e', textTransform: 'uppercase',
            }}>LIVE</span>
          </div>
          <p style={{ fontSize: 12, color: '#55556a', maxWidth: 500 }}>
            Gulf Oil Desk — WTI/Brent benchmarks, EIA inventory, OPEC+ production, energy equities & headlines.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <StatBlock label="Brent–WTI Spread" value={`$${Math.abs(spread).toFixed(2)}`} color={spread > 0 ? '#22c55e' : '#8888a8'} />
          <StatBlock label="WTI Crude" value={price(wti?.price ?? null)} color={changeColor(wti?.changePercent ?? null)} sub={pct(wti?.changePercent ?? null)} />
          <StatBlock label="Brent Crude" value={price(brent?.price ?? null)} color={changeColor(brent?.changePercent ?? null)} sub={pct(brent?.changePercent ?? null)} />
        </div>
      </div>

      {/* Futures price cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {OIL_SYMBOLS.map(sym => {
          const q = get(sym)
          return <FuturesCard key={sym} symbol={sym} quote={q} />
        })}
      </div>

      {/* Chart + right panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <TradingChart symbol="CL=F" height={420} showToolbar />
        </div>

        {/* Right: Regional + OPEC */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Regional benchmarks */}
          <Panel title="Regional Benchmarks">
            {REGIONAL_BENCHMARKS.map(r => {
              const q = r.symbol ? get(r.symbol) : null
              const p = q?.price ?? r.price
              const chg = q?.changePercent
              return (
                <div key={r.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{r.flag}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#eeeef5' }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: '#55556a' }}>{r.note}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                      {p != null ? `$${p.toFixed(2)}` : '—'}
                    </div>
                    <div style={{ fontSize: 10, color: changeColor(chg ?? null) }}>
                      {chg != null ? pct(chg) : '+5.9%'}
                    </div>
                  </div>
                </div>
              )
            })}
          </Panel>

          {/* OPEC+ status */}
          <Panel title="OPEC+ Status">
            {OPEC_DATA.map(c => (
              <div key={c.country} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{c.flag}</span>
                  <span style={{ fontSize: 11, color: '#8888a8' }}>{c.country}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                    {c.mbd.toFixed(1)}M bpd
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                    background: c.mbd <= c.quota ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: c.mbd <= c.quota ? '#22c55e' : '#ef4444',
                  }}>
                    {c.mbd <= c.quota ? 'ON QUOTA' : 'OVER'}
                  </span>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* EIA Inventory */}
      {energyData?.inventory && energyData.inventory.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>EIA Inventory Data</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {energyData.inventory.map(m => <InventoryCard key={m.symbol} metric={m} />)}
          </div>
        </div>
      )}

      {/* Market drivers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { icon: '🚢', title: 'Tanker Rates',     value: 'VLCC: $85,000/day', change: '+12%',  up: true,  note: 'TD3C Ras Tanura–Japan' },
          { icon: '🏗️', title: 'US Rig Count',     value: '487 active rigs',   change: '-3 WoW', up: false, note: 'Baker Hughes weekly' },
          { icon: '🛡️', title: 'US SPR',           value: '371M barrels',      change: 'Stable', up: true,  note: 'DoE strategic reserve' },
          { icon: '📦', title: 'Cushing Stocks',   value: '24.2M barrels',     change: '-1.4M',  up: false, note: 'EIA Cushing, OK' },
        ].map(item => <DriverCard key={item.title} {...item} />)}
      </div>

      {/* Energy equities */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Energy Equities & ETFs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {EQUITY_SYMBOLS.map(sym => {
            const q = get(sym)
            return <FuturesCard key={sym} symbol={sym} quote={q} />
          })}
          {energyData?.equities?.filter(e => !EQUITY_SYMBOLS.includes(e.symbol)).map(e => (
            <FuturesCard key={e.symbol} symbol={e.symbol} quote={{
              symbol: e.symbol, name: e.name,
              price: e.price, change: e.change, changePercent: e.changePercent,
            }} />
          ))}
        </div>
      </div>

      {/* Oil calendar */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Energy Calendar</h2>
        <Calendar ticker="CL=F,BZ=F,NG=F,XLE" compact />
      </div>

      {/* Oil news */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Oil & Energy Headlines</h2>
        <NewsFeed defaultTicker="" compact />
      </div>
    </div>
  )
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function StatBlock({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 10, color: '#55556a', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color }}>{sub}</div>}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.055)',
      borderRadius: 14, padding: '14px 14px',
    }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: '#eeeef5', marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  )
}

function FuturesCard({ symbol, quote }: { symbol: string; quote: Quote | undefined }) {
  const NAMES: Record<string, string> = {
    'CL=F': 'WTI Crude', 'BZ=F': 'Brent', 'NG=F': 'Nat Gas',
    'HO=F': 'Heating Oil', 'RB=F': 'Gasoline',
    'XOM': 'Exxon', 'CVX': 'Chevron', 'COP': 'ConocoPhillips',
    'SHEL': 'Shell', 'BP': 'BP', 'XLE': 'Energy ETF',
  }
  const up = (quote?.changePercent ?? 0) >= 0
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.055)',
      borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10, color: '#55556a', marginBottom: 4 }}>{NAMES[symbol] ?? symbol}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
        {price(quote?.price ?? null)}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, marginTop: 4,
        color: up ? '#22c55e' : '#ef4444',
      }}>
        {pct(quote?.changePercent ?? null)}
      </div>
    </div>
  )
}

function InventoryCard({ metric: m }: { metric: OilMetric }) {
  const up = m.change >= 0
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.055)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: '#55556a', marginBottom: 6 }}>{m.name}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
        {m.price.toFixed(1)} <span style={{ fontSize: 10, color: '#55556a' }}>{m.unit}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
        <span style={{ color: up ? '#22c55e' : '#ef4444' }}>WoW: {pct(m.changePercent)}</span>
        {m.rolling30d != null && <span style={{ color: '#8888a8' }}>30d: {pct(m.rolling30d)}</span>}
        {m.rolling90d != null && <span style={{ color: '#8888a8' }}>90d: {pct(m.rolling90d)}</span>}
      </div>
    </div>
  )
}

function DriverCard({ icon, title, value, change, up, note }: {
  icon: string; title: string; value: string; change: string; up: boolean; note: string
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.055)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
          background: up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: up ? '#22c55e' : '#ef4444',
        }}>{change}</span>
      </div>
      <div style={{ fontSize: 11, color: '#55556a', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#55556a', marginTop: 4 }}>{note}</div>
    </div>
  )
}

function CompactOilBar({ wti, brent, spread }: {
  wti: Quote | undefined; brent: Quote | undefined; spread: number
}) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {[
        { label: 'WTI', q: wti },
        { label: 'Brent', q: brent },
      ].map(({ label, q }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#55556a' }}>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
            {price(q?.price ?? null)}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: changeColor(q?.changePercent ?? null) }}>
            {pct(q?.changePercent ?? null)}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#55556a' }}>Spread</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#8888a8' }}>${Math.abs(spread).toFixed(2)}</span>
      </div>
    </div>
  )
}
