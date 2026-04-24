'use client'

import { useState, useRef, useEffect } from 'react'
import type { AssistantResponse } from '@/lib/types'

const QUICK_PROMPTS = [
  { label: '☀️ Morning Brief',       prompt: 'Generate a quick morning market briefing'                              },
  { label: '🛢️ Oil Summary',         prompt: 'Summarize oil market headlines and key data points'                   },
  { label: '📅 Today\'s Events',     prompt: 'What economic events should I watch today and this week?'             },
  { label: '📊 Watchlist Digest',    prompt: 'Summarize today\'s market news for my watchlist'                      },
  { label: '🏦 Macro Snapshot',      prompt: 'What macro factors matter most for markets right now?'               },
]

interface Message {
  role: 'user' | 'assistant'
  content: string | AssistantResponse
  timestamp: Date
  error?: boolean
}

interface Props {
  defaultTickers?: string[]
  compact?: boolean
}

export default function AssistantPanel({ defaultTickers = [], compact = false }: Props) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [tickers,   setTickers]   = useState<string[]>(defaultTickers)
  const [tickerInput, setTickerInput] = useState(defaultTickers.join(', '))
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync tickers from outside
  useEffect(() => {
    setTickers(defaultTickers)
    setTickerInput(defaultTickers.join(', '))
  }, [defaultTickers.join(',')])

  async function sendPrompt(prompt: string) {
    if (!prompt.trim() || loading) return

    const userMsg: Message = { role: 'user', content: prompt, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tickers,
          timeWindow: '24h',
        }),
      })
      const data: AssistantResponse | { error: string } = await res.json()

      if ('error' in data) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.error, timestamp: new Date(), error: true,
        }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data, timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
        error: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleTickerChange(val: string) {
    setTickerInput(val)
    const parsed = val.split(/[,\s]+/).map(t => t.trim().toUpperCase()).filter(Boolean)
    setTickers(parsed)
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendPrompt(input)}
            placeholder="Ask about markets, oil, macro…"
            style={{
              flex: 1, height: 36, paddingLeft: 12, paddingRight: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: '#eeeef5', fontSize: 12,
            }}
          />
          <button
            onClick={() => sendPrompt(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: loading ? 'rgba(0,212,170,0.3)' : '#00d4aa',
              color: '#000', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {loading ? '…' : '↑'}
          </button>
        </div>
        {messages.length > 0 && (
          <CompactResponse msg={messages[messages.length - 1]} />
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4aa22, #0084ff22)',
          border: '1px solid rgba(0,212,170,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#eeeef5' }}>Gulf Oil Desk AI</div>
          <div style={{ fontSize: 10, color: '#55556a' }}>Market intelligence assistant</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: 10, color: '#55556a' }}>Online</span>
        </div>
      </div>

      {/* Ticker context bar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 10, color: '#55556a', whiteSpace: 'nowrap' }}>Context:</span>
        <input
          value={tickerInput}
          onChange={e => handleTickerChange(e.target.value)}
          placeholder="CL=F, BZ=F, XOM…"
          style={{
            flex: 1, height: 26, paddingLeft: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6, color: '#eeeef5', fontSize: 11,
            fontFamily: 'monospace',
          }}
        />
        {tickers.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {tickers.slice(0, 4).map(t => (
              <span key={t} style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                background: 'rgba(0,212,170,0.1)',
                border: '1px solid rgba(0,212,170,0.2)',
                color: '#00d4aa', fontFamily: 'monospace', fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 16,
        minHeight: 300,
      }}>
        {messages.length === 0 && (
          <WelcomeScreen onSelect={(p) => sendPrompt(p)} />
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        {QUICK_PROMPTS.map(qp => (
          <button
            key={qp.label}
            onClick={() => sendPrompt(qp.prompt)}
            disabled={loading}
            style={{
              fontSize: 10, padding: '4px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#8888a8', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.08)'; e.currentTarget.style.color = '#00d4aa' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8888a8' }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendPrompt(input)}
            placeholder="Ask about oil markets, macro events, watchlist…"
            disabled={loading}
            style={{
              flex: 1, height: 40, paddingLeft: 14, paddingRight: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, color: '#eeeef5', fontSize: 13,
            }}
          />
          <button
            onClick={() => sendPrompt(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none', flexShrink: 0,
              background: loading || !input.trim() ? 'rgba(0,212,170,0.2)' : '#00d4aa',
              color: '#000', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? '⋯' : '↑'}
          </button>
        </div>
        <p style={{ fontSize: 9, color: '#55556a', marginTop: 6, lineHeight: 1.5 }}>
          For informational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  )
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function WelcomeScreen({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 10px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', marginBottom: 6 }}>Gulf Oil Desk AI</div>
      <p style={{ fontSize: 12, color: '#55556a', maxWidth: 340, margin: '0 auto 20px', lineHeight: 1.6 }}>
        Ask me about oil markets, macro events, your watchlist, or get a morning briefing.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380, margin: '0 auto' }}>
        {QUICK_PROMPTS.map(qp => (
          <button
            key={qp.label}
            onClick={() => onSelect(qp.prompt)}
            style={{
              padding: '10px 16px', borderRadius: 10, textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#8888a8', cursor: 'pointer', fontSize: 12,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.15)'; e.currentTarget.style.color = '#eeeef5' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8888a8' }}
          >
            {qp.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message: m }: { message: Message }) {
  const isUser = m.role === 'user'
  const isStr  = typeof m.content === 'string'

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '80%', padding: '10px 14px',
          background: 'rgba(0,212,170,0.12)',
          border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: '14px 14px 4px 14px',
          fontSize: 13, color: '#eeeef5', lineHeight: 1.5,
        }}>
          {m.content as string}
        </div>
      </div>
    )
  }

  if (m.error || isStr) {
    return (
      <div style={{
        padding: '10px 14px',
        background: m.error ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${m.error ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.055)'}`,
        borderRadius: '4px 14px 14px 14px',
        fontSize: 12, color: m.error ? '#ef4444' : '#eeeef5',
      }}>
        {m.content as string}
      </div>
    )
  }

  const r = m.content as AssistantResponse
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.055)',
      borderRadius: '4px 14px 14px 14px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Summary */}
      <p style={{ fontSize: 13, color: '#eeeef5', lineHeight: 1.6, margin: 0 }}>{r.summary}</p>

      {/* Bullets */}
      {r.bullets?.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {r.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: '#00d4aa', marginTop: 2, flexShrink: 0 }}>›</span>
              <span style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.5 }}>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Calendar events */}
      {r.calendarEvents?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: '#55556a', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Watch Events
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {r.calendarEvents.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                  background: e.impact === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  color: e.impact === 'high' ? '#ef4444' : '#f59e0b',
                }}>
                  {e.impact?.toUpperCase()}
                </span>
                <span style={{ fontSize: 11, color: '#eeeef5' }}>{e.title}</span>
                <span style={{ fontSize: 10, color: '#55556a', marginLeft: 'auto' }}>
                  {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting links */}
      {r.links?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: '#55556a', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {r.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 11, color: '#00d4aa', textDecoration: 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                [{l.source}] {l.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Meta + disclaimer */}
      <div style={{
        paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
      }}>
        <p style={{ fontSize: 9, color: '#55556a', lineHeight: 1.5, margin: 0, flex: 1 }}>
          ⚠️ {r.disclaimer}
        </p>
        {r.confidence != null && (
          <span style={{ fontSize: 9, color: '#55556a', whiteSpace: 'nowrap' }}>
            Confidence: {Math.round(r.confidence * 100)}%
          </span>
        )}
      </div>

      <div style={{ fontSize: 9, color: '#55556a' }}>
        {m.timestamp.toLocaleTimeString()}
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#00d4aa',
            animation: `pulse-dot 1s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: '#55556a' }}>Analyzing market data…</span>
    </div>
  )
}

function CompactResponse({ msg }: { msg: Message }) {
  if (typeof msg.content === 'string') {
    return (
      <div style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.6 }}>{msg.content}</div>
    )
  }
  if (msg.role === 'user') return null
  const r = msg.content as AssistantResponse
  return (
    <div style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.6 }}>
      <p style={{ margin: '0 0 6px', color: '#eeeef5' }}>{r.summary}</p>
      {r.bullets?.[0] && <p style={{ margin: 0 }}>› {r.bullets[0]}</p>}
    </div>
  )
}
