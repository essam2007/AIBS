'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'price_alert' | 'news' | 'market' | 'oil'
  title: string
  body: string
  time: Date
  read: boolean
  badge?: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'price_alert',
    title: 'Crude Oil Alert',
    body: 'WTI Crude broke above $88/bbl — up 6.8% on Hormuz tensions',
    time: new Date(Date.now() - 5 * 60000),
    read: false,
    badge: 'ALERT',
  },
  {
    id: '2',
    type: 'news',
    title: 'Breaking: OPEC+ Meeting',
    body: 'OPEC+ members convene emergency session to discuss production targets amid surging demand',
    time: new Date(Date.now() - 22 * 60000),
    read: false,
    badge: 'NEWS',
  },
  {
    id: '3',
    type: 'market',
    title: 'S&P 500 Update',
    body: 'Futures trading up 0.42% ahead of earnings season — tech leads gains',
    time: new Date(Date.now() - 45 * 60000),
    read: true,
    badge: 'MARKET',
  },
  {
    id: '4',
    type: 'oil',
    title: 'Brent Crude Spread',
    body: 'Brent-WTI spread widens to $7.20 — largest gap since Q3 2024',
    time: new Date(Date.now() - 2 * 3600000),
    read: true,
    badge: 'OIL',
  },
  {
    id: '5',
    type: 'news',
    title: 'Fed Rate Decision',
    body: 'Federal Reserve holds rates steady; Chair signals data-dependent approach for remainder of 2026',
    time: new Date(Date.now() - 5 * 3600000),
    read: true,
    badge: 'FED',
  },
]

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const TYPE_COLORS: Record<Notification['type'], string> = {
  price_alert: '#f59e0b',
  news: '#3b82f6',
  market: '#8b5cf6',
  oil: '#00d4aa',
}

interface Props {
  onClose: () => void
}

export default function NotificationsPanel({ onClose }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unread = notifs.filter(n => !n.read).length
  const displayed = filter === 'unread' ? notifs.filter(n => !n.read) : notifs

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id: string) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  const dismiss = (id: string) => setNotifs(n => n.filter(x => x.id !== id))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 98,
        }}
      />

      {/* Panel */}
      <div
        className="slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          background: '#0d0d1a',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5' }}>Notifications</span>
            {unread > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: 20,
              }}>{unread}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {unread > 0 && (
              <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: 8,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#8888a8',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px 0' }}>
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab-btn${filter === f ? ' active' : ''}`}
              style={{ fontSize: 12 }}
            >
              {f === 'all' ? 'All' : `Unread ${unread > 0 ? `(${unread})` : ''}`}
            </button>
          ))}
        </div>

        <div className="divider" style={{ margin: '12px 0 0' }} />

        {/* Notification list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#55556a' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p style={{ fontSize: 14 }}>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
            </div>
          ) : (
            displayed.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${n.read ? 'transparent' : TYPE_COLORS[n.type]}`,
                  background: n.read ? 'transparent' : 'rgba(255,255,255,0.015)',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,255,255,0.015)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        className="badge"
                        style={{
                          background: `${TYPE_COLORS[n.type]}18`,
                          color: TYPE_COLORS[n.type],
                          fontSize: 9,
                        }}
                      >
                        {n.badge}
                      </span>
                      {!n.read && (
                        <span className="pulse-dot" style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: TYPE_COLORS[n.type],
                          display: 'inline-block',
                        }} />
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#eeeef5', marginBottom: 3, lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.5 }}>{n.body}</p>
                    <p style={{ fontSize: 11, color: '#55556a', marginTop: 6 }}>{timeAgo(n.time)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#55556a',
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.055)',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#55556a' }}>Alerts update every 30 seconds</p>
        </div>
      </div>
    </>
  )
}
