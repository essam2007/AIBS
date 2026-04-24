'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const NotificationsPanel = dynamic(() => import('./NotificationsPanel'), { ssr: false })

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/':          { title: 'Gulf Oil Desk', sub: 'Global Energy Terminal'      },
  '/markets':   { title: 'Markets',       sub: 'Live Overview'               },
  '/charts':    { title: 'Charts',        sub: 'Advanced Analytics'          },
  '/news':      { title: 'News',          sub: 'Market Intelligence'         },
  '/calendar':  { title: 'Calendar',      sub: 'Economic Events'             },
  '/oil':       { title: 'Oil Desk',      sub: 'Crude & Energy Markets'      },
  '/deals':     { title: 'Deal Desk',     sub: 'Buy & Sell Crude Oil'        },
  '/assistant': { title: 'AI Assistant',  sub: 'Gulf Oil Desk Intelligence'  },
}

export default function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount] = useState(3)
  const [time, setTime] = useState('')
  const [search, setSearch] = useState('')
  const [mktOpen, setMktOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const nyTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/New_York' })
      setTime(nyTime + ' ET')
      const h = now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' })
      const day = now.toLocaleString('en-US', { weekday: 'short', timeZone: 'America/New_York' })
      const n = parseInt(h)
      setMktOpen(n >= 9 && n < 16 && !['Sat', 'Sun'].includes(day))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  const { title, sub } = PAGE_TITLES[pathname] ?? PAGE_TITLES['/']

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !search.trim()) return
    const q = search.trim().toUpperCase()
    // If looks like a ticker, go to charts
    if (/^[A-Z\^=\-]+$/.test(q)) {
      router.push(`/charts?symbol=${encodeURIComponent(q)}`)
    } else {
      router.push(`/news?q=${encodeURIComponent(search.trim())}`)
    }
    setSearch('')
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, left: 0, right: 0, height: 60,
        background: 'rgba(7,7,14,0.94)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 20, gap: 16, zIndex: 40,
      }}>

        {/* Page title */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5', whiteSpace: 'nowrap' }}>{title}</h1>
            <span style={{ fontSize: 11, color: '#55556a', whiteSpace: 'nowrap' }}>/ {sub}</span>
          </div>
        </div>

        {/* Market status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          padding: '3px 9px', borderRadius: 20,
          background: mktOpen ? 'rgba(34,197,94,0.08)' : 'rgba(136,136,168,0.08)',
          border: `1px solid ${mktOpen ? 'rgba(34,197,94,0.2)' : 'rgba(136,136,168,0.15)'}`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: mktOpen ? '#22c55e' : '#8888a8', display: 'inline-block' }} />
          <span style={{ fontSize: 10, color: mktOpen ? '#22c55e' : '#8888a8', fontWeight: 600 }}>
            {mktOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: 'relative', width: 220 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556a', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search ticker or news…"
            style={{
              width: '100%', paddingLeft: 30, paddingRight: 10, height: 32,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: '#eeeef5', fontSize: 12,
            }}
          />
        </div>

        {/* Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#8888a8', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
            {time}
          </span>
        </div>

        {/* Notifications */}
        <button onClick={() => setShowNotif(v => !v)} style={{
          position: 'relative', flexShrink: 0,
          background: showNotif ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${showNotif ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 9, width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: showNotif ? '#00d4aa' : '#8888a8', transition: 'all 0.15s ease',
        }} title="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700,
              width: 15, height: 15, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #07070e',
            }}>{unreadCount}</span>
          )}
        </button>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #00d4aa, #0084ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#000', cursor: 'pointer',
        }} title="Account">G</div>
      </header>

      {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
    </>
  )
}
