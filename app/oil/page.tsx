'use client'

import useSWR from 'swr'
import dynamic from 'next/dynamic'
import NewsCard from '@/components/news/NewsCard'
import PriceCard from '@/components/market/PriceCard'

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false })

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Quote { symbol: string; name: string; price: number | null; change: number | null; changePercent: number | null; high: number | null; low: number | null }
interface Article { id: string; title: string; summary: string; source: string; sourceUrl: string; url: string; publishedAt: string; category: string }

const OIL_SYMBOLS = ['CL=F', 'BZ=F', 'NG=F', 'HO=F', 'RB=F']

const REGIONS = [
  { name: 'Gulf Region', flag: '🇦🇪', price: 88.40, change: 5.8, note: 'Dubai Crude' },
  { name: 'West Africa', flag: '🇳🇬', price: 92.10, change: 6.1, note: 'Bonny Light' },
  { name: 'North Sea', flag: '🇬🇧', price: 91.22, change: 5.18, note: 'Brent' },
  { name: 'Americas', flag: '🇺🇸', price: 87.43, change: 5.63, note: 'WTI' },
  { name: 'Asia Pacific', flag: '🇸🇬', price: 89.80, change: 5.9, note: 'MOPS' },
]

const MARKET_DATA_ROWS = [
  { label: 'WTI Crude (CL=F)', symbol: 'CL=F', unit: '$/bbl' },
  { label: 'Brent Crude (BZ=F)', symbol: 'BZ=F', unit: '$/bbl' },
  { label: 'Natural Gas (NG=F)', symbol: 'NG=F', unit: '$/MMBtu' },
  { label: 'Heating Oil (HO=F)', symbol: 'HO=F', unit: '$/gal' },
  { label: 'RBOB Gasoline (RB=F)', symbol: 'RB=F', unit: '$/gal' },
]

export default function OilPage() {
  const { data: mktData } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${OIL_SYMBOLS.join(',')}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  const { data: newsData } = useSWR<{ articles: Article[] }>(
    '/api/news?category=oil',
    fetcher,
    { refreshInterval: 300000 }
  )

  const quotes = mktData?.quotes ?? OIL_SYMBOLS.map(s => ({
    symbol: s, name: s, price: null, change: null, changePercent: null, high: null, low: null,
  }))
  const articles = newsData?.articles ?? []

  const wti = quotes.find(q => q.symbol === 'CL=F')
  const brent = quotes.find(q => q.symbol === 'BZ=F')

  const wtiPrice = wti?.price ?? 87.43
  const brentPrice = brent?.price ?? 91.22
  const spread = brentPrice - wtiPrice

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(7,7,14,0) 60%)',
        border: '1px solid rgba(0,212,170,0.1)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🛢️</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eeeef5' }}>Oil Desk</h1>
            <span className="badge" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 9 }}>
              LIVE
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#55556a', maxWidth: 500 }}>
            Professional oil & energy market intelligence. Track WTI, Brent, regional benchmarks, OPEC developments, and Gulf market dynamics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#55556a', marginBottom: 2 }}>Brent–WTI Spread</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: spread > 0 ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
              ${Math.abs(spread).toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#55556a', marginBottom: 2 }}>WTI Crude</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
              ${wtiPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Price cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {quotes.map(q => (
          <PriceCard
            key={q.symbol}
            symbol={q.symbol}
            name={q.name}
            price={q.price}
            change={q.change}
            changePercent={q.changePercent}
            highlight={q.symbol === 'CL=F' || q.symbol === 'BZ=F'}
          />
        ))}
      </div>

      {/* Chart + regional data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <TradingChart symbol="CL=F" height={420} showToolbar />
        </div>

        {/* Regional benchmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 14,
            padding: 16,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', marginBottom: 14 }}>Regional Benchmarks</h3>
            {REGIONS.map(r => (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{r.flag}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: '#55556a' }}>{r.note}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                    ${r.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: '#22c55e' }}>+{r.change.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* OPEC supply */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 14,
            padding: 16,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>OPEC+ Status</h3>
            {[
              { country: 'Saudi Arabia', mbd: 9.0, quota: 9.0, flag: '🇸🇦' },
              { country: 'Russia', mbd: 9.2, quota: 9.5, flag: '🇷🇺' },
              { country: 'UAE', mbd: 3.2, quota: 3.2, flag: '🇦🇪' },
              { country: 'Iraq', mbd: 4.3, quota: 4.0, flag: '🇮🇶' },
            ].map(c => (
              <div key={c.country} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{c.flag}</span>
                  <span style={{ fontSize: 11, color: '#8888a8' }}>{c.country}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                    {c.mbd.toFixed(1)}M bpd
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: c.mbd <= c.quota ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: c.mbd <= c.quota ? '#22c55e' : '#ef4444',
                      fontSize: 9,
                    }}
                  >
                    {c.mbd <= c.quota ? 'ON QUOTA' : 'OVER'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market drivers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {[
          { icon: '🚢', title: 'Tanker Rates', value: 'VLCC: $85,000/day', change: '+12%', up: true, note: 'TD3C Ras Tanura–Japan' },
          { icon: '🏗️', title: 'Rig Count', value: 'US: 487 rigs', change: '-3 WoW', up: false, note: 'Baker Hughes data' },
          { icon: '🛡️', title: 'Strategic Reserve', value: 'SPR: 371M bbl', change: 'Stable', up: true, note: 'US DoE weekly' },
          { icon: '📦', title: 'Cushing Stocks', value: '24.2M barrels', change: '-1.4M', up: false, note: 'EIA inventory' },
        ].map(item => (
          <div
            key={item.title}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.055)',
              borderRadius: 12,
              padding: '14px 16px',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span
                className="badge"
                style={{ background: item.up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: item.up ? '#22c55e' : '#ef4444', fontSize: 10 }}
              >
                {item.change}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#55556a', marginBottom: 2 }}>{item.title}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: '#55556a' }}>{item.note}</div>
          </div>
        ))}
      </div>

      {/* Oil news */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', marginBottom: 16 }}>Oil & Energy News</h2>
        {articles.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {articles.slice(0, 8).map(a => <NewsCard key={a.id} article={a} featured />)}
          </div>
        )}
      </div>

      {/* List your oil CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(59,130,246,0.05))',
        border: '1px solid rgba(0,212,170,0.2)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', marginBottom: 6 }}>
            🛢️ List Your Oil
          </h3>
          <p style={{ fontSize: 13, color: '#8888a8', maxWidth: 480 }}>
            Connect your oil production and trading activities directly to Gulf Oil Desk.
            List barrels for sale, post bids, and reach global buyers — all from this terminal.
          </p>
        </div>
        <button className="btn-accent">
          Get Started →
        </button>
      </div>
    </div>
  )
}
