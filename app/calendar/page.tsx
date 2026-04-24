'use client'

import Calendar from '@/components/calendar/Calendar'

export default function CalendarPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>Economic Calendar</h1>
        <p style={{ fontSize: 12, color: '#55556a' }}>
          High-impact macro events — EIA inventory releases, FOMC decisions, CPI, NFP, OPEC meetings and more.
          Filter by impact level, country, and ticker relevance.
        </p>
      </div>
      <Calendar />
    </div>
  )
}
