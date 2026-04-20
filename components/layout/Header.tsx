'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const NotificationsPanel = dynamic(() => import('./NotificationsPanel'), { ssr: false })

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Gulf Oil Desk', sub: 'Global Terminal' },
  '/markets': { title: 'Markets', sub: 'Live Overview' },
  '/charts': { title: 'Charts', sub: 'Advanced Analytics' },
  '/news': { title: 'Discover', sub: 'News & Intelligence' },
  '/oil': { title: 'Oil Desk', sub: 'Crude & Energy Markets' },
}

export default function Header() {
  const pathname = usePathname()
  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount] = useState(2)
  const [time, setTime] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'America/New_York',
      }) + ' ET')
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  const { title, sub } = PAGE_TITLES[pathname] ?? PAGE_TITLES['/']

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'rgba(7,7,14,0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 20,
          paddingRight: 20,
          gap: 20,
          zIndex: 40,
        }}
      >
        {/* Page title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: '#eeeef5', whiteSpace: 'nowrap' }}>{title}</h1>
            <span style={{ fontSize: 12, color: '#55556a', whiteSpace: 'nowrap' }}>/ {sub}</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 240 }}>
          <svg
            width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556a', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol, news..."
            style={{
              width: '100%',
              paddingLeft: 32,
              paddingRight: 12,
              height: 34,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              color: '#eeeef5',
              fontSize: 13,
            }}
          />
        </div>

        {/* Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse-dot" style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#22c55e', display: 'inline-block',
          }} />
          <span style={{ fontSize: 12, color: '#8888a8', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
            {time}
          </span>
        </div>

        {/* Notifications bell */}
        <button
          onClick={() => setShowNotif(v => !v)}
          style={{
            position: 'relative',
            background: showNotif ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${showNotif ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 9,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: showNotif ? '#00d4aa' : '#8888a8',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          title="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#ef4444',
                color: 'white',
                fontSize: 9,
                fontWeight: 700,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #07070e',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4aa, #0084ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title="Account"
        >
          G
        </div>
      </header>

      {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
    </>
  )
}
