'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import type { EconomicEvent } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface CalendarFilters {
  impact:  string
  country: string
  ticker:  string
}

const DEFAULT: CalendarFilters = { impact: 'all', country: 'All', ticker: '' }

export function useCalendarStore(initial?: Partial<CalendarFilters>) {
  const [filters, setFilters] = useState<CalendarFilters>({ ...DEFAULT, ...initial })

  const buildUrl = () => {
    const p = new URLSearchParams()
    if (filters.impact  !== 'all') p.set('impact',  filters.impact)
    if (filters.country !== 'All') p.set('country', filters.country)
    if (filters.ticker)            p.set('ticker',  filters.ticker)
    return `/api/calendar?${p}`
  }

  const { data, isLoading, mutate } = useSWR<{ events: EconomicEvent[]; updatedAt?: string }>(
    buildUrl(),
    fetcher,
    { refreshInterval: 15 * 60_000 }
  )

  const updateFilter = useCallback(<K extends keyof CalendarFilters>(key: K, val: CalendarFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }))
  }, [])

  const highImpactToday = (data?.events ?? []).filter(e => {
    const today = new Date().toDateString()
    return e.impact === 'high' && new Date(e.date).toDateString() === today
  })

  return { events: data?.events ?? [], isLoading, filters, updateFilter, highImpactToday, refresh: mutate }
}
