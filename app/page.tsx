'use client'

import { useState } from 'react'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import NewsFeed from '@/components/news/NewsFeed'
import Calendar from '@/components/calendar/Calendar'
import AssistantPanel from '@/components/assistant/AssistantPanel'

const ChartWidget = dynamic(() => import('@/components/charts/ChartWidget'), { ssr: false })

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Quote {
  symbol: string; name: string; price: number | null
  change: number | null; changePercent: number | null
}

const WATCHLIST = ['CL=F', 'BZ=F', 'NG=F', 'GC=F', '^GSPC', '^IXIC', 'BTC-USD', '^VIX']
const TABS = ['Overview', 'News', 'Calendar', 'AI Assistant'] as const
type DashTab = typeof TABS[number]

function fmt(v: number | null, dec = 2): string { return v == null ? '—' : v.toFixed(dec) }
function pct(v: number | null): string { return v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` }
function up(v: number | null): boolean { return (v ?? 0) >= 0 }

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>('Overview')
  const [selectedSymbol, setSelectedSymbol] = useState('CL=F')

  const { data: mktData } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${WATCHLIST.join(',')}`,
    fetcher,
    { refreshInterval: 30_000 }
  )

  const quotes = mktData?.quotes ?? WATCHLIST.map(s => ({ symbol: s, name: s, price: null, change: null, changePercent: null }))
  const wti   = quotes.find(q => q.symbol === 'CL=F')
  const brent = quotes.find(q => q.symbol === 'BZ=F')
  const spread = (brent?.price ?? 0) - (wti?.price ?? 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero ticker strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 8,
      }}>
        {quotes.map(q => (
          <button
            key={q.symbol}
            onClick={() => setSelectedSymbol(q.symbol)}
            style={{
              background: selectedSymbol === q.symbol ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${selectedSymbol === q.symbol ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.055)'}`,
              borderRadius: 10, padding: '10px 12px', textAlign: 'left',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: 9, color: '#55556a', marginBottom: 3, fontFamily: 'monospace' }}>{q.symbol}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>
              {q.price != null ? `$${fmt(q.price)}` : '—'}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: up(q.changePercent) ? '#22c55e' : '#ef4444' }}>
              {pct(q.changePercent)}
            </div>
          </button>
        ))}
      </div>

      {/* Dashboard tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === t ? '#00d4aa' : 'transparent'}`,
            color: activeTab === t ? '#00d4aa' : '#55556a',
            fontSize: 12, fontWeight: activeTab === t ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Main chart + sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <ChartWidget initialSymbol={selectedSymbol} height={440} showTabs={false} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Oil summary */}
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.055)',
                borderRadius: 14, padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: '#eeeef5' }}>Oil Markets</h2>
                  <Link href="/oil" style={{ fontSize: 11, color: '#00d4aa', textDecoration: 'none' }}>View all →</Link>
                </div>
                {[
                  { label: 'Brent–WTI Spread', value: `$${Math.abs(spread).toFixed(2)}`, sub: 'per barrel', color: '#8888a8' },
                  { label: 'WTI (CL=F)',  value: wti?.price   ? `$${fmt(wti.price)}`   : '—', sub: pct(wti?.changePercent   ?? null), color: up(wti?.changePercent ?? null) ? '#22c55e' : '#ef4444' },
                  { label: 'Brent (BZ=F)', value: brent?.price ? `$${fmt(brent.price)}` : '—', sub: pct(brent?.changePercent ?? null), color: up(brent?.changePercent ?? null) ? '#22c55e' : '#ef4444' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 11, color: '#8888a8' }}>{row.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>{row.value}</div>
                      <div style={{ fontSize: 10, color: row.color }}>{row.sub}</div>
                    </div>
                  </div>
                ))}
                <Link href="/oil" style={{ display: 'block', marginTop: 10 }}>
                  <button style={{
                    width: '100%', padding: '7px 0', borderRadius: 8,
                    background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
                    color: '#00d4aa', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>Open Oil Desk →</button>
                </Link>
              </div>

              {/* Deal Desk CTA */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 14, padding: 16,
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#eeeef5', marginBottom: 6 }}>🤝 Deal Desk</h3>
                <p style={{ fontSize: 11, color: '#8888a8', lineHeight: 1.6, marginBottom: 12 }}>
                  Buy or sell crude oil barrels. Post your offer and connect with global counterparties.
                </p>
                <Link href="/deals">
                  <button style={{
                    width: '100%', padding: '8px 0', borderRadius: 8,
                    background: '#22c55e', border: 'none', color: '#000',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>Browse Deals →</button>
                </Link>
              </div>

              {/* AI quick brief */}
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.055)',
                borderRadius: 14, padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>🤖</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#00d4aa' }}>AI Brief</span>
                </div>
                <AssistantPanel defaultTickers={[selectedSymbol, 'CL=F', 'BZ=F']} compact />
              </div>
            </div>
          </div>

          {/* Stats footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { label: 'Market Data',    value: 'Yahoo Finance',         icon: '📊', href: '/markets'  },
              { label: 'News Sources',   value: 'Reuters · CNBC · More', icon: '📰', href: '/news'     },
              { label: 'Economic Events', value: 'EIA · Fed · OPEC+',   icon: '📅', href: '/calendar' },
              { label: 'Terminal',       value: 'Gulf Oil Desk v2.0',    icon: '🛢️', href: '/'         },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, color: '#55556a', marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#8888a8', fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'News' && (
        <NewsFeed defaultTicker={selectedSymbol} watchlist={WATCHLIST} />
      )}

      {activeTab === 'Calendar' && (
        <Calendar ticker={selectedSymbol} />
      )}

      {activeTab === 'AI Assistant' && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 16, overflow: 'hidden', minHeight: 600,
        }}>
          <AssistantPanel defaultTickers={[selectedSymbol, ...WATCHLIST.slice(0, 4)]} />
        </div>
      )}
    </div>
  )
}
