'use client'

import useSWR from 'swr'
import dynamic from 'next/dynamic'
import PriceCard from '@/components/market/PriceCard'
import NewsCard from '@/components/news/NewsCard'
import Link from 'next/link'

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false })

const fetcher = (url: string) => fetch(url).then(r => r.json())

const KEY_SYMBOLS = ['CL=F', 'BZ=F', 'NG=F', 'GC=F', '^GSPC', '^IXIC', 'BTC-USD', '^VIX']

interface Quote {
  symbol: string; name: string; price: number | null
  change: number | null; changePercent: number | null
}
interface Article {
  id: string; title: string; summary: string; source: string
  sourceUrl: string; url: string; publishedAt: string; category: string
}

const MINI_SPARKLINES: Record<string, number[]> = {
  'CL=F': [82, 83, 81, 84, 86, 85, 87, 88],
  'BZ=F': [85, 86, 84, 87, 89, 88, 90, 91],
  'GC=F': [3280, 3295, 3310, 3300, 3320, 3315, 3330, 3342],
  '^GSPC': [5500, 5520, 5510, 5540, 5560, 5580, 5610, 5623],
  '^IXIC': [17500, 17600, 17550, 17650, 17720, 17780, 17820, 17854],
  'BTC-USD': [71000, 72500, 71800, 73000, 74500, 73200, 74800, 73923],
  'NG=F': [2.3, 2.25, 2.2, 2.18, 2.15, 2.12, 2.16, 2.14],
  '^VIX': [19, 18.5, 17.8, 18.2, 17.5, 17.0, 17.8, 17.48],
}

export default function Dashboard() {
  const { data: mktData } = useSWR<{ quotes: Quote[] }>(
    `/api/market-data?symbols=${KEY_SYMBOLS.join(',')}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  const { data: newsData } = useSWR<{ articles: Article[] }>(
    '/api/news',
    fetcher,
    { refreshInterval: 300000 }
  )

  const quotes = mktData?.quotes ?? KEY_SYMBOLS.map(s => ({
    symbol: s, name: s, price: null, change: null, changePercent: null,
  }))
  const articles = newsData?.articles ?? []

  const wti = quotes.find(q => q.symbol === 'CL=F')
  const brent = quotes.find(q => q.symbol === 'BZ=F')
  const wtiUp = (wti?.changePercent ?? 0) >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero stat bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {quotes.map(q => (
          <PriceCard
            key={q.symbol}
            symbol={q.symbol}
            name={q.name}
            price={q.price}
            change={q.change}
            changePercent={q.changePercent}
            highlight={q.symbol === 'CL=F' || q.symbol === 'BZ=F'}
            sparkline={MINI_SPARKLINES[q.symbol]}
            onClick={() => {}}
          />
        ))}
      </div>

      {/* Main content: Chart + News */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Chart panel */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <TradingChart symbol="CL=F" height={460} showToolbar />
        </div>

        {/* Right side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Oil market summary */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 14,
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5' }}>Oil Markets</h2>
              <Link href="/oil" style={{ fontSize: 11, color: '#00d4aa', textDecoration: 'none' }}>View all →</Link>
            </div>

            {[
              { label: 'WTI–Brent Spread', value: wti && brent && wti.price && brent.price
                ? `$${(brent.price - wti.price).toFixed(2)}`
                : '—', sub: 'per barrel', color: '#8888a8' },
              { label: 'WTI Crude (CL=F)', value: wti?.price ? `$${wti.price.toFixed(2)}` : '—', sub: `${wtiUp ? '+' : ''}${(wti?.changePercent ?? 0).toFixed(2)}%`, color: wtiUp ? '#22c55e' : '#ef4444' },
              { label: 'Brent Crude (BZ=F)', value: brent?.price ? `$${brent.price.toFixed(2)}` : '—', sub: `${(brent?.changePercent ?? 0) >= 0 ? '+' : ''}${(brent?.changePercent ?? 0).toFixed(2)}%`, color: (brent?.changePercent ?? 0) >= 0 ? '#22c55e' : '#ef4444' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 12, color: '#8888a8' }}>{row.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>{row.value}</div>
                  <div style={{ fontSize: 10, color: row.color }}>{row.sub}</div>
                </div>
              </div>
            ))}

            <Link href="/oil">
              <button className="btn-ghost" style={{ width: '100%', marginTop: 12, fontSize: 12 }}>
                Open Oil Desk →
              </button>
            </Link>
          </div>

          {/* Market sentiment */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 14,
            padding: 16,
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Market Sentiment</h2>
            {[
              { label: 'S&P 500', bull: 72 },
              { label: 'Crude Oil', bull: 65 },
              { label: 'Gold', bull: 78 },
              { label: 'BTC', bull: 58 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#8888a8' }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: item.bull > 50 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {item.bull}% Bull
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.bull}%`,
                    background: item.bull > 50
                      ? `linear-gradient(90deg, #22c55e, #16a34a)`
                      : `linear-gradient(90deg, #ef4444, #dc2626)`,
                    borderRadius: 2,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5' }}>Market Intelligence</h2>
            <span className="pulse-dot" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e', display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, color: '#55556a' }}>Live</span>
          </div>
          <Link href="/news" style={{ fontSize: 12, color: '#00d4aa', textDecoration: 'none' }}>View all news →</Link>
        </div>

        {articles.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {articles.slice(0, 8).map(a => (
              <NewsCard key={a.id} article={a} featured />
            ))}
          </div>
        )}
      </div>

      {/* Bottom stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {[
          { label: 'Data Source', value: 'Yahoo Finance', icon: '📊' },
          { label: 'News Sources', value: 'Reuters · CNBC · MW', icon: '📰' },
          { label: 'Update Rate', value: 'Every 30 seconds', icon: '⚡' },
          { label: 'Terminal', value: 'Gulf Oil Desk v1.0', icon: '🛢️' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: '#55556a', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#8888a8', fontWeight: 500 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
