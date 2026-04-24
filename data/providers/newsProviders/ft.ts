/**
 * Financial Times public RSS — headline + abstract only (FT subscription required for full text).
 */
import type { NewsItem } from '@/lib/types'
import { fetchRSS } from './base'

const FT_RSS = 'https://www.ft.com/rss/home/uk'
const FT_MARKETS = 'https://www.ft.com/rss/home/markets'

export async function fetchLatest(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    fetchRSS(FT_RSS,     'FT', 'https://ft.com', 'markets',  6),
    fetchRSS(FT_MARKETS, 'FT', 'https://ft.com', 'markets',  6),
  ])
  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }
  return items
}

export function normalize(raw: NewsItem): NewsItem {
  return { ...raw, source: 'Financial Times', summary: raw.summary || '[Abstract only — full article requires FT subscription]' }
}
