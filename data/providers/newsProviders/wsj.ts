/**
 * WSJ public RSS — headline + link only (no article body scraping, compliant with terms).
 * Full text requires a WSJ subscription; this provider surfaces headlines only.
 */
import type { NewsItem } from '@/lib/types'
import { fetchRSS } from './base'

// WSJ public feeds — markets and energy
const FEEDS = [
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',    cat: 'markets' as const },
  { url: 'https://feeds.a.dj.com/rss/RSSWSJD.xml',           cat: 'business' as const },
]

export async function fetchLatest(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(f => fetchRSS(f.url, 'WSJ', 'https://wsj.com', f.cat, 8))
  )
  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }
  return items
}

export function normalize(raw: NewsItem): NewsItem {
  return { ...raw, source: 'WSJ', summary: raw.summary || '[Headline only — full article requires WSJ subscription]' }
}
