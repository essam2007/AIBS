import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  url: string
  publishedAt: string
  category: string
  imageUrl?: string
}

const RSS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'business' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', category: 'economy' },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', category: 'markets' },
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice.com', category: 'oil' },
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC Business', category: 'business' },
]

async function parseFeed(feedUrl: string, source: string, category: string): Promise<NewsItem[]> {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 GulfOilDesk/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Feed ${feedUrl} returned ${res.status}`)
  const xml = await res.text()
  return parseRSSXML(xml, source, category)
}

function parseRSSXML(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)

  for (const match of itemMatches) {
    const item = match[1]
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link') || extractTag(item, 'guid')
    const description = extractTag(item, 'description') || extractTag(item, 'content:encoded') || ''
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date')
    const mediaUrl = extractMedia(item)

    if (!title || !link) continue

    items.push({
      id: `${source}-${Buffer.from(link).toString('base64').slice(0, 16)}`,
      title: cleanText(title),
      summary: cleanText(description).slice(0, 280),
      source,
      sourceUrl: feedUrl(source),
      url: link.trim(),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      category,
      imageUrl: mediaUrl,
    })

    if (items.length >= 8) break
  }
  return items
}

function feedUrl(source: string) {
  const map: Record<string, string> = {
    'Reuters': 'https://reuters.com',
    'CNBC': 'https://cnbc.com',
    'MarketWatch': 'https://marketwatch.com',
    'OilPrice.com': 'https://oilprice.com',
    'CNBC Business': 'https://cnbc.com/business',
  }
  return map[source] ?? '#'
}

function extractTag(xml: string, tag: string): string {
  const escaped = tag.replace(':', '\\:')
  const m = xml.match(new RegExp(`<${escaped}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${escaped}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function extractMedia(item: string): string | undefined {
  const m = item.match(/media:content[^>]+url=["']([^"']+)/i)
    || item.match(/media:thumbnail[^>]+url=["']([^"']+)/i)
    || item.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp))/i)
  return m?.[1]
}

function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const feeds = category ? RSS_FEEDS.filter(f => f.category === category) : RSS_FEEDS

  const results = await Promise.allSettled(
    feeds.map(f => parseFeed(f.url, f.source, f.category))
  )

  const all: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // If all feeds fail, return curated mock news
  if (all.length === 0) {
    return Response.json(
      { articles: getMockNews(), updatedAt: new Date().toISOString(), source: 'fallback' },
      { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' } }
    )
  }

  // Sort by date descending
  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return Response.json(
    { articles: all.slice(0, 40), updatedAt: new Date().toISOString(), source: 'rss' },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
  )
}

function getMockNews(): NewsItem[] {
  return [
    {
      id: 'mock-1',
      title: 'WTI Crude Surges 7% as Strait of Hormuz Tensions Escalate',
      summary: 'West Texas Intermediate crude jumped nearly 7% to around $88.48/barrel after Iran reimposed strict controls over the Strait of Hormuz. The U.S. Navy\'s seizure of an Iranian-flagged vessel over the weekend further inflamed tensions.',
      source: 'Reuters',
      sourceUrl: 'https://reuters.com',
      url: '#',
      publishedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      category: 'oil',
    },
    {
      id: 'mock-2',
      title: 'S&P 500 Futures Slide as Iran Tensions Escalate, Oil Prices Spike',
      summary: 'U.S. stock index futures fell on Monday after crude oil surged on escalating Middle East tensions. The S&P 500 futures pointed to a 0.4% decline at the open as investors weighed the impact on inflation.',
      source: 'MarketWatch',
      sourceUrl: 'https://marketwatch.com',
      url: '#',
      publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      category: 'markets',
    },
    {
      id: 'mock-3',
      title: 'Federal Reserve Holds Rates Steady, Eyes Data-Dependent Path',
      summary: 'The Federal Reserve held its benchmark interest rate steady and signaled it needs more evidence that inflation is cooling before cutting rates. Chair Jerome Powell emphasized a data-dependent approach.',
      source: 'CNBC',
      sourceUrl: 'https://cnbc.com',
      url: '#',
      publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      category: 'economy',
    },
    {
      id: 'mock-4',
      title: 'OPEC+ Considers Emergency Production Cut Amid Price Volatility',
      summary: 'OPEC+ ministers are in informal discussions about an emergency meeting to address volatile oil markets. Sources say the group is weighing a temporary production cut of 500,000 barrels per day.',
      source: 'OilPrice.com',
      sourceUrl: 'https://oilprice.com',
      url: '#',
      publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      category: 'oil',
    },
    {
      id: 'mock-5',
      title: 'Bitcoin Pulls Back 2.5% Despite Bullish Longer-Term Outlook',
      summary: 'Bitcoin retreated to around $73,900 as risk-off sentiment swept crypto markets. Analysts note long-term on-chain metrics remain bullish with institutional inflows continuing.',
      source: 'MarketWatch',
      sourceUrl: 'https://marketwatch.com',
      url: '#',
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      category: 'markets',
    },
    {
      id: 'mock-6',
      title: 'Gulf States Announce Record Oil Infrastructure Investment',
      summary: 'Saudi Arabia and UAE unveiled a combined $180 billion investment plan to expand oil production capacity and petrochemical facilities over the next decade, targeting 15 million bpd by 2030.',
      source: 'Reuters',
      sourceUrl: 'https://reuters.com',
      url: '#',
      publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      category: 'oil',
    },
    {
      id: 'mock-7',
      title: 'Major Banks Report Surging Trading, Investment Revenue in Q1',
      summary: 'Goldman Sachs and Morgan Stanley both reported blowout first-quarter results, driven by a surge in commodities trading and equity underwriting as market volatility created lucrative opportunities.',
      source: 'CNBC',
      sourceUrl: 'https://cnbc.com',
      url: '#',
      publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      category: 'business',
    },
    {
      id: 'mock-8',
      title: 'Natural Gas Prices Fall as U.S. Output Hits Record High',
      summary: 'Henry Hub natural gas futures dropped to a 3-month low as U.S. production reaches record levels. Warmer-than-expected forecasts for the coming weeks weigh on demand outlook.',
      source: 'OilPrice.com',
      sourceUrl: 'https://oilprice.com',
      url: '#',
      publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      category: 'oil',
    },
  ]
}
