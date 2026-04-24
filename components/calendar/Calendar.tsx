'use client'

import { useState } from 'react'
import useSWR from 'swr'
import type { EconomicEvent } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const IMPACT_COLORS = {
  high:   { bg: 'rgba(239,68,68,0.15)',    text: '#ef4444',  dot: '#ef4444'  },
  medium: { bg: 'rgba(245,158,11,0.15)',   text: '#f59e0b',  dot: '#f59e0b'  },
  low:    { bg: 'rgba(136,136,168,0.15)',  text: '#8888a8',  dot: '#8888a8'  },
}

const IMPACT_FILTERS = ['All', 'High', 'Medium', 'Low']
const COUNTRY_FILTERS = ['All', 'United States', 'Euro Area', 'United Kingdom', 'China', 'Japan']

function formatEventDate(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET',
  }
}

function groupByDate(events: EconomicEvent[]): Map<string, EconomicEvent[]> {
  const map = new Map<string, EconomicEvent[]>()
  for (const e of events) {
    const key = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return map
}

interface Props {
  ticker?: string
  compact?: boolean
}

export default function Calendar({ ticker, compact = false }: Props) {
  const [impact,  setImpact]  = useState('All')
  const [country, setCountry] = useState('All')
  const [view,    setView]    = useState<'list' | 'timeline'>('list')

  const buildUrl = () => {
    const p = new URLSearchParams()
    if (impact !== 'All')   p.set('impact',  impact.toLowerCase())
    if (country !== 'All')  p.set('country', country)
    if (ticker)             p.set('ticker',  ticker)
    return `/api/calendar?${p}`
  }

  const { data, isLoading } = useSWR<{ events: EconomicEvent[]; updatedAt?: string }>(
    buildUrl(),
    fetcher,
    { refreshInterval: 15 * 60 * 1000 }
  )

  const events = data?.events ?? []
  const grouped = groupByDate(events)

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
          ))
        ) : events.slice(0, 6).map(e => (
          <CompactEventRow key={e.id} event={e} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>

        {/* Impact filter */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {IMPACT_FILTERS.map(i => (
            <button
              key={i}
              onClick={() => setImpact(i)}
              className={`tab-btn${impact === i ? ' active' : ''}`}
              style={{
                fontSize: 10, padding: '3px 8px',
                color: impact === i && i !== 'All' ? IMPACT_COLORS[(i.toLowerCase() as 'high') || 'medium'].text : undefined,
              }}
            >
              {i !== 'All' && (
                <span style={{
                  display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                  background: IMPACT_COLORS[(i.toLowerCase() as 'high') || 'medium'].dot,
                  marginRight: 4,
                }} />
              )}
              {i}
            </button>
          ))}
        </div>

        {/* Country filter */}
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          style={{ height: 28, padding: '0 6px', fontSize: 11, borderRadius: 6, minWidth: 120 }}
        >
          {COUNTRY_FILTERS.map(c => <option key={c}>{c}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {(['list', 'timeline'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`tab-btn${view === v ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 8px' }}
            >
              {v === 'list' ? '≡ List' : '⊢ Timeline'}
            </button>
          ))}
        </div>

        {data?.updatedAt && (
          <span style={{ fontSize: 10, color: '#55556a' }}>
            Updated {new Date(data.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Events */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
        ))
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <p style={{ color: '#55556a', fontSize: 13 }}>No events match your filters.</p>
        </div>
      ) : view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[...grouped.entries()].map(([dateLabel, dayEvents]) => (
            <DateGroup key={dateLabel} label={dateLabel} events={dayEvents} />
          ))}
        </div>
      ) : (
        <TimelineView events={events} />
      )}
    </div>
  )
}

function DateGroup({ label, events }: { label: string; events: EconomicEvent[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#8888a8', letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 8,
        paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.map(e => <EventRow key={e.id} event={e} />)}
      </div>
    </div>
  )
}

function EventRow({ event: e }: { event: EconomicEvent }) {
  const { time } = formatEventDate(e.date)
  const ic = IMPACT_COLORS[e.impact]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '72px 1fr auto',
      gap: 12, alignItems: 'center',
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.015)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 8,
      transition: 'all 0.15s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
    >
      {/* Time */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#8888a8', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
          {time}
        </div>
        <div style={{ fontSize: 9, color: '#55556a' }}>{e.country.slice(0, 12)}</div>
      </div>

      {/* Title + tickers */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ic.dot, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>{e.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 10, color: '#55556a' }}>
          {e.forecast  && <span>Forecast: <b style={{ color: '#8888a8' }}>{e.forecast}</b></span>}
          {e.previous  && <span>Prev: <b style={{ color: '#8888a8' }}>{e.previous}</b></span>}
          {e.actual    && <span>Actual: <b style={{ color: e.actual > (e.forecast ?? '0') ? '#22c55e' : '#ef4444' }}>{e.actual}</b></span>}
        </div>
      </div>

      {/* Impact badge */}
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '2px 7px', borderRadius: 4,
        background: ic.bg, color: ic.text,
        whiteSpace: 'nowrap',
      }}>
        {e.impact}
      </span>
    </div>
  )
}

function CompactEventRow({ event: e }: { event: EconomicEvent }) {
  const { time } = formatEventDate(e.date)
  const ic = IMPACT_COLORS[e.impact]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.015)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 8,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ic.dot, display: 'inline-block', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#eeeef5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
        <div style={{ fontSize: 10, color: '#55556a' }}>{e.country} · {time}</div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: ic.bg, color: ic.text, flexShrink: 0 }}>
        {e.impact.toUpperCase()}
      </span>
    </div>
  )
}

function TimelineView({ events }: { events: EconomicEvent[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: 10, top: 0, bottom: 0, width: 1,
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {events.map(e => {
          const { date, time } = formatEventDate(e.date)
          const ic = IMPACT_COLORS[e.impact]
          return (
            <div key={e.id} style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Dot on timeline */}
              <div style={{
                position: 'absolute', left: -18, top: 12,
                width: 8, height: 8, borderRadius: '50%',
                background: ic.dot,
                border: `2px solid rgba(7,7,14,0.9)`,
                zIndex: 1,
              }} />
              <div style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(255,255,255,0.015)',
                border: `1px solid rgba(255,255,255,0.04)`,
                borderRadius: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>{e.title}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: ic.bg, color: ic.text }}>
                    {e.impact.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#55556a' }}>
                  {date} · {time} · {e.country}
                  {e.forecast && <span style={{ marginLeft: 8 }}>Forecast: {e.forecast}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
