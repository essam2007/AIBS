'use client'

interface Article {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  url: string
  publishedAt: string
  category: string
  imageUrl?: string
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const SOURCE_COLORS: Record<string, string> = {
  'Reuters': '#f59e0b',
  'MarketWatch': '#3b82f6',
  'CNBC': '#ef4444',
  'CNBC Business': '#ef4444',
  'OilPrice.com': '#00d4aa',
  'Bloomberg': '#a78bfa',
  'WSJ': '#475569',
  'FT': '#e11d48',
}

const CAT_COLORS: Record<string, string> = {
  oil: '#00d4aa',
  markets: '#3b82f6',
  business: '#8b5cf6',
  economy: '#f59e0b',
  crypto: '#f97316',
}

interface Props {
  article: Article
  featured?: boolean
  compact?: boolean
}

export default function NewsCard({ article, featured, compact }: Props) {
  const srcColor = SOURCE_COLORS[article.source] ?? '#8888a8'
  const catColor = CAT_COLORS[article.category] ?? '#8888a8'

  if (compact) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          gap: 12,
          padding: '12px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.paddingLeft = '4px')}
        onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
      >
        <div style={{
          width: 3, borderRadius: 2,
          background: srcColor, flexShrink: 0, minHeight: '100%',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: '#eeeef5', lineHeight: 1.5, fontWeight: 500 }}>{article.title}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: srcColor, fontWeight: 600 }}>{article.source}</span>
            <span style={{ fontSize: 10, color: '#55556a' }}>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </a>
    )
  }

  if (featured) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 14,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.055)'
          }}
        >
          {/* Image placeholder */}
          <div style={{
            height: 140,
            background: `linear-gradient(135deg, ${catColor}18, rgba(255,255,255,0.02))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="1" opacity={0.3}>
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span
              className="badge"
              style={{
                position: 'absolute', top: 12, left: 12,
                background: `${catColor}22`,
                color: catColor,
                textTransform: 'uppercase',
                fontSize: 9,
              }}
            >
              {article.category}
            </span>
          </div>

          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', lineHeight: 1.5, marginBottom: 8 }}>
              {article.title}
            </h3>
            {article.summary && (
              <p style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {article.summary}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: srcColor }}>{article.source}</span>
              <span style={{ fontSize: 11, color: '#55556a' }}>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </a>
    )
  }

  // Standard card
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 12,
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          gap: 12,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.055)'
        }}
      >
        <div style={{ width: 3, borderRadius: 2, background: catColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <span
              className="badge"
              style={{ background: `${catColor}18`, color: catColor, textTransform: 'uppercase', fontSize: 9 }}
            >
              {article.category}
            </span>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#eeeef5', lineHeight: 1.5, marginBottom: 6 }}>
            {article.title}
          </h3>
          {article.summary && (
            <p style={{
              fontSize: 12, color: '#8888a8', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              marginBottom: 8,
            }}>
              {article.summary}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: srcColor }}>{article.source}</span>
            <span style={{ fontSize: 11, color: '#55556a' }}>{timeAgo(article.publishedAt)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#55556a', marginLeft: 'auto' }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  )
}
