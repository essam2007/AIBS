'use client'

import AssistantPanel from '@/components/assistant/AssistantPanel'

export default function AssistantPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>AI Assistant</h1>
        <p style={{ fontSize: 12, color: '#55556a' }}>
          Gulf Oil Desk Intelligence — ask about oil markets, macro events, your watchlist, or generate a morning briefing.
          Set your ticker context above the chat to receive targeted analysis.
        </p>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.055)',
        borderRadius: 16, overflow: 'hidden',
        minHeight: 680,
      }}>
        <AssistantPanel defaultTickers={['CL=F', 'BZ=F', 'NG=F', '^GSPC']} />
      </div>
    </div>
  )
}
