'use client'

import { useState } from 'react'
import useSWR from 'swr'
import NewsCard from '@/components/news/NewsCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Article {
  id: string; title: string; summary: string; source: string
  sourceUrl: string; url: string; publishedAt: string; category: string
}

const FILTERS = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'oil', label: 'Oil & Energy', icon: '🛢️' },
  { value: 'markets', label: 'Markets', icon: '📈' },
  { value: 'economy', label: 'Economy', icon: '🏦' },
  { value: 'business', label: 'Business', icon: '💼' },
]

const SOCIAL_FEEDS = [
  { handle: '@WalterBloomberg', name: 'Walter Bloomberg', desc: 'Breaking financial headlines', platform: 'X', color: '#1d9bf0' },
  { handle: '@WSJmarkets', name: 'WSJ Markets', desc: 'Wall Street Journal markets desk', platform: 'X', color: '#1d9bf0' },
  { handle: '@zerohedge', name: 'ZeroHedge', desc: 'Alternative financial analysis', platform: 'X', color: '#1d9bf0' },
  { handle: '@WhaleWire', name: 'Whale Wire', desc: 'Whale wallet movements', platform: 'X', color: '#1d9bf0' },
  { handle: '@OilPrice_com', name: 'OilPrice', desc: 'Oil & energy market news', platform: 'X', color: '#00d4aa' },
  { handle: '@Reuters_Biz', name: 'Reuters Biz', desc: 'Reuters business reporting', platform: 'X', color: '#f59e0b' },
]

const TRENDING = [
  { tag: 'Strait of Hormuz', count: '12.4K', hot: true },
  { tag: 'OPEC+ Cut', count: '8.2K', hot: true },
  { tag: 'Fed Rate Decision', count: '6.1K', hot: false },
  { tag: 'WTI Crude Surge', count: '5.8K', hot: true },
  { tag: 'Oil Supply Shock', count: '4.3K', hot: false },
  { tag: 'Tesla Earnings', count: '3.9K', hot: false },
  { tag: 'Bitcoin Rally', count: '3.1K', hot: false },
]

export default function NewsPage() {
  const [filter, setFilter] = useState('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const url = filter === 'all' ? '/api/news' : `/api/news?category=${filter}`
  const { data, isLoading } = useSWR<{ articles: Article[]; updatedAt?: string }>(
    url,
    fetcher,
    { refreshInterval: 300000 }
  )

  const articles = data?.articles ?? []

  return (
    <div style={{ display: 'flex', gap: 24 }}>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#eeeef5' }}>Discover</h1>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setLayout('grid')} className={`tab-btn${layout === 'grid' ? ' active' : ''}`}>Grid</button>
              <button onClick={() => setLayout('list')} className={`tab-btn${layout === 'list' ? ' active' : ''}`}>List</button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#55556a' }}>
            Live news from Reuters, CNBC, MarketWatch, OilPrice.com and more
            {data?.updatedAt && (
              <span> · Updated {new Date(data.updatedAt).toLocaleTimeString()}</span>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`tab-btn${filter === f.value ? ' active' : ''}`}
              style={{ fontSize: 13, gap: 6, display: 'inline-flex', alignItems: 'center' }}
            >
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>

        {/* Article grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: layout === 'grid' ? 200 : 90, borderRadius: 12 }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 16,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z"/>
            </svg>
            <p style={{ color: '#55556a', fontSize: 14 }}>No articles found for this filter.</p>
          </div>
        ) : layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {articles.map(a => <NewsCard key={a.id} article={a} featured />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {articles.map(a => <NewsCard key={a.id} article={a} />)}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Trending topics */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 14,
          padding: 16,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Trending Topics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {TRENDING.map((t, i) => (
              <div
                key={t.tag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: i < TRENDING.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#55556a', fontVariantNumeric: 'tabular-nums', width: 16 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>
                      #{t.tag.replace(/\s+/g, '')}
                      {t.hot && (
                        <span style={{ marginLeft: 6, fontSize: 9, color: '#ef4444', fontWeight: 700 }}>🔥</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: '#55556a' }}>{t.count} posts</div>
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Social feeds */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 14,
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5' }}>Followed Sources</h3>
            <span
              className="badge"
              style={{ background: 'rgba(29,155,240,0.12)', color: '#1d9bf0', fontSize: 9 }}
            >
              X/TWITTER
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SOCIAL_FEEDS.map(f => (
              <div
                key={f.handle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'padding-left 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.paddingLeft = '4px')}
                onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${f.color}20`,
                  border: `1px solid ${f.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 12, color: f.color, fontWeight: 700,
                }}>
                  {f.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: '#55556a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.desc}</div>
                </div>
                <span style={{ fontSize: 10, color: f.color, fontWeight: 600, flexShrink: 0 }}>{f.handle}</span>
              </div>
            ))}
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: 12, fontSize: 11 }}>
            Manage Sources
          </button>
        </div>

        {/* Market brief */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(59,130,246,0.04))',
          border: '1px solid rgba(0,212,170,0.15)',
          borderRadius: 14,
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00d4aa' }}>AI Market Brief</span>
          </div>
          <p style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.7 }}>
            Oil markets facing historic volatility as Strait of Hormuz controls tighten.
            WTI and Brent both surged 6-7%. Broader markets edging lower on risk-off sentiment.
            Fed rate path unchanged; watching earnings season closely.
          </p>
          <div style={{ marginTop: 10, fontSize: 10, color: '#55556a' }}>
            Generated from top financial headlines · Apr 20, 2026
          </div>
        </div>
      </div>
    </div>
  )
}
