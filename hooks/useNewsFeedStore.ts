'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import type { NewsItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface NewsFeedFilters {
  category:  string
  source:    string
  sentiment: string
  ticker:    string
  window:    string
}

const DEFAULT_FILTERS: NewsFeedFilters = {
  category:  'all',
  source:    'All',
  sentiment: 'All',
  ticker:    '',
  window:    '24h',
}

function buildUrl(filters: NewsFeedFilters): string {
  const p = new URLSearchParams()
  if (filters.category  !== 'all') p.set('category',  filters.category)
  if (filters.ticker)              p.set('ticker',    filters.ticker)
  if (filters.sentiment !== 'All') p.set('sentiment', filters.sentiment.toLowerCase())
  if (filters.source    !== 'All') p.set('source',    filters.source)
  return `/api/news?${p}`
}

export function useNewsFeedStore(initialFilters?: Partial<NewsFeedFilters>) {
  const [filters, setFilters] = useState<NewsFeedFilters>({ ...DEFAULT_FILTERS, ...initialFilters })

  const { data, isLoading, mutate } = useSWR<{ articles: NewsItem[]; updatedAt?: string }>(
    buildUrl(filters),
    fetcher,
    { refreshInterval: 300_000, dedupingInterval: 10_000 }
  )

  const updateFilter = useCallback(<K extends keyof NewsFeedFilters>(key: K, value: NewsFeedFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), [])

  const articles = data?.articles ?? []

  // Client-side time window filter
  const withinWindow = (iso: string) => {
    const h = (Date.now() - new Date(iso).getTime()) / 3_600_000
    if (filters.window === '1h')  return h <= 1
    if (filters.window === '6h')  return h <= 6
    if (filters.window === '24h') return h <= 24
    if (filters.window === '3d')  return h <= 72
    return true
  }

  const filtered = filters.window === '7d' ? articles : articles.filter(a => withinWindow(a.publishedAt))

  // Rolling sentiment per ticker
  const sentimentByTicker = filtered.reduce<Record<string, number[]>>((acc, a) => {
    for (const sym of a.symbols) {
      acc[sym] = acc[sym] ?? []
      acc[sym].push(a.sentiment)
    }
    return acc
  }, {})

  const rollingScore = (ticker: string): number => {
    const scores = sentimentByTicker[ticker] ?? []
    if (!scores.length) return 0
    return scores.reduce((s, v) => s + v, 0) / scores.length
  }

  return { articles: filtered, isLoading, filters, updateFilter, resetFilters, rollingScore, refresh: mutate }
}
