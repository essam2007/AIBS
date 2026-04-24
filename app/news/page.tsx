'use client'

import NewsFeed from '@/components/news/NewsFeed'
import AssistantPanel from '@/components/assistant/AssistantPanel'

export default function NewsPage() {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>Market Intelligence</h1>
          <p style={{ fontSize: 12, color: '#55556a' }}>
            Live news from Reuters, CNBC, MarketWatch, OilPrice.com, Yahoo Finance, WSJ, FT and Twitter/X.
            Filter by source, ticker, sentiment, and time window.
          </p>
        </div>
        <NewsFeed />
      </div>

      {/* Right sidebar — AI brief */}
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.055)',
          borderRadius: 14, overflow: 'hidden',
          position: 'sticky', top: 76,
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
        }}>
          <AssistantPanel defaultTickers={['CL=F', 'BZ=F', '^GSPC']} compact={false} />
        </div>
      </div>
    </div>
  )
}
