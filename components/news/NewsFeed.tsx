'use client'

import { useState, useCallback, useDeferredValue } from 'react'
import useSWR from 'swr'
import type { NewsItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const SOURCES = ['All', 'Reuters', 'CNBC', 'MarketWatch', 'OilPrice.com', 'Yahoo Finance', 'WSJ', 'FT', 'Twitter/X']
const CATEGORIES = [
  { value: 'all',      label: 'All',         icon: '🌐' },
  { value: 'oil',      label: 'Oil & Energy', icon: '🛢️' },
  { value: 'markets',  label: 'Markets',      icon: '📈' },
  { value: 'economy',  label: 'Economy',      icon: '🏦' },
  { value: 'business', label: 'Business',     icon: '💼' },
]
const WINDOWS   = ['1h', '6h', '24h', '3d', '7d']
const SENTIMENT = ['All', 'Bullish', 'Bearish', 'Neutral']

function sentimentColor(label: string): string {
  if (label === 'bullish') return '#22c55e'
  if (label === 'bearish') return '#ef4444'
  return '#8888a8'
}

function sentimentBg(label: string): string {
  if (label === 'bullish') return 'rgba(34,197,94,0.12)'
  if (label === 'bearish') return 'rgba(239,68,68,0.12)'
  return 'rgba(136,136,168,0.12)'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function withinWindow(iso: string, window: string): boolean {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / 3600000
  if (window === '1h')  return hours <= 1
  if (window === '6h')  return hours <= 6
  if (window === '24h') return hours <= 24
  if (window === '3d')  return hours <= 72
  return true  // 7d
}

interface Props {
  defaultTicker?: string
  watchlist?: string[]
  compact?: boolean
}

export default function NewsFeed({ defaultTicker, watchlist = [], compact = false }: Props) {
  const [category,   setCategory]  = useState('all')
  const [source,     setSource]    = useState('All')
  const [sentiment,  setSentiment] = useState('All')
  const [window,     setWindow]    = useState('24h')
  const [tickerQ,    setTickerQ]   = useState(defaultTicker ?? '')
  const [layout,     setLayout]    = useState<'grid' | 'list'>('grid')
  const deferredTicker = useDeferredValue(tickerQ)

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (category !== 'all')    params.set('category',  category)
    if (deferredTicker)        params.set('ticker',    deferredTicker)
    if (sentiment !== 'All')   params.set('sentiment', sentiment.toLowerCase())
    if (source !== 'All')      params.set('source',    source)
    return `/api/news?${params}`
  }, [category, deferredTicker, sentiment, source])

  const { data, isLoading } = useSWR<{ articles: NewsItem[]; updatedAt?: string }>(
    buildUrl(),
    fetcher,
    { refreshInterval: 300000, dedupingInterval: 10000 }
  )

  let articles = data?.articles ?? []
  // Client-side time window filter
  if (window !== '7d') {
    articles = articles.filter(a => withinWindow(a.publishedAt, window))
  }
  // Client-side watchlist overlay
  if (watchlist.length > 0 && !deferredTicker) {
    const wl = watchlist.map(t => t.toUpperCase())
    const filtered = articles.filter(a => a.symbols.some(s => wl.includes(s)))
    if (filtered.length > 0) articles = filtered
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`tab-btn${category === c.value ? ' active' : ''}`}
              style={{ fontSize: 11, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Ticker search */}
        <input
          value={tickerQ}
          onChange={e => setTickerQ(e.target.value.toUpperCase())}
          placeholder="Ticker filter…"
          style={{
            width: 110, height: 28, paddingLeft: 8, paddingRight: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6, color: '#eeeef5', fontSize: 12,
          }}
        />

        {/* Source */}
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          style={{ height: 28, padding: '0 6px', fontSize: 11, minWidth: 100, borderRadius: 6 }}
        >
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Sentiment */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {SENTIMENT.map(s => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              className={`tab-btn${sentiment === s ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 7px' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Time window */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {WINDOWS.map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`tab-btn${window === w ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 7px' }}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Layout toggle */}
        {!compact && (
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
            {(['grid', 'list'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={`tab-btn${layout === l ? ' active' : ''}`}
                style={{ fontSize: 10, padding: '3px 8px' }}
              >
                {l === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#55556a' }}>
        <span className="pulse-dot" style={{
          width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block',
        }} />
        {isLoading ? 'Fetching…' : `${articles.length} stories`}
        {data?.updatedAt && <span>· Updated {new Date(data.updatedAt).toLocaleTimeString()}</span>}
      </div>

      {/* Article grid / list */}
      {isLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: 10,
        }}>
          {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: layout === 'grid' ? 180 : 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <p style={{ color: '#55556a', fontSize: 13 }}>No articles match your filters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: compact ? 6 : 10,
        }}>
          {articles.slice(0, compact ? 6 : 40).map(a => (
            <ArticleCard key={a.id} article={a} compact={compact || layout === 'list'} />
          ))}
        </div>
      )}
    </div>
  )
}

function ArticleCard({ article: a, compact }: { article: NewsItem; compact: boolean }) {
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 10 : 12,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.055)',
        borderRadius: 12,
        padding: compact ? '10px 12px' : 14,
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.045)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'
      }}
    >
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#00d4aa', fontWeight: 600 }}>{a.source}</span>
          <span style={{ fontSize: 10, color: '#55556a' }}>·</span>
          <span style={{ fontSize: 10, color: '#55556a' }}>{timeAgo(a.publishedAt)}</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '1px 6px', borderRadius: 4,
              background: sentimentBg(a.sentimentLabel),
              color: sentimentColor(a.sentimentLabel),
            }}
          >
            {a.sentimentLabel}
          </span>
        </div>

        <h3 style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 600, color: '#eeeef5',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: compact ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          marginBottom: compact ? 0 : 8,
        }}>
          {a.title}
        </h3>

        {!compact && a.summary && (
          <p style={{
            fontSize: 11, color: '#8888a8', lineHeight: 1.6,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: 8,
          }}>
            {a.summary}
          </p>
        )}

        {/* Symbol tags */}
        {a.symbols.length > 0 && !compact && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {a.symbols.slice(0, 4).map(s => (
              <span
                key={s}
                style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 4,
                  background: 'rgba(0,212,170,0.08)',
                  border: '1px solid rgba(0,212,170,0.15)',
                  color: '#00d4aa', fontFamily: 'monospace', fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
