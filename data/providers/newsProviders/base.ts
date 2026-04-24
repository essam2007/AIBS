import type { NewsItem } from '@/lib/types'
import { scoreSentiment, sentimentLabel } from '@/lib/sentiment'
import { extractTickers } from '@/lib/ticker'

export function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function extractTag(xml: string, tag: string): string {
  const t = tag.replace(':', '\\:')
  const m = xml.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${t}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function extractMedia(item: string): string | undefined {
  const m = item.match(/media:content[^>]+url=["']([^"']+)/i)
    || item.match(/media:thumbnail[^>]+url=["']([^"']+)/i)
    || item.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp))/i)
  return m?.[1]
}

export function parseRSSXML(
  xml: string,
  source: string,
  sourceUrl: string,
  category: NewsItem['category'],
  limit = 10,
): NewsItem[] {
  const items: NewsItem[] = []
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)

  for (const match of itemMatches) {
    const item = match[1]
    const title = cleanText(extractTag(item, 'title'))
    const link  = extractTag(item, 'link') || extractTag(item, 'guid')
    const desc  = cleanText(extractTag(item, 'description') || extractTag(item, 'content:encoded') || '')
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date')
    const imageUrl = extractMedia(item)

    if (!title || !link) continue

    const combined = `${title} ${desc}`
    const score = scoreSentiment(combined)

    items.push({
      id: `${source}-${Buffer.from(link).toString('base64').slice(0, 16)}`,
      source,
      sourceUrl,
      title,
      summary: desc.slice(0, 300),
      url: link.trim(),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      category,
      symbols: extractTickers(combined),
      sentiment: score,
      sentimentLabel: sentimentLabel(score),
      imageUrl,
    })

    if (items.length >= limit) break
  }
  return items
}

export async function fetchRSS(
  feedUrl: string,
  source: string,
  sourceUrl: string,
  category: NewsItem['category'],
  limit = 10,
): Promise<NewsItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 OilDesk/2.0',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    },
    signal: AbortSignal.timeout(6000),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`RSS ${source}: HTTP ${res.status}`)
  const xml = await res.text()
  return parseRSSXML(xml, source, sourceUrl, category, limit)
}
