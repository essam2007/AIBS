import { NextRequest } from 'next/server'
import type { NewsItem } from '@/lib/types'
import { fetchRSS } from '@/data/providers/newsProviders/base'
import * as Yahoo from '@/data/providers/newsProviders/yahoo'
import * as WSJ   from '@/data/providers/newsProviders/wsj'
import * as FT    from '@/data/providers/newsProviders/ft'
import * as X     from '@/data/providers/newsProviders/x'
import { CONFIG }  from '@/lib/config'
import { getCache, setCache } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters',       sourceUrl: 'https://reuters.com',      category: 'business' as const },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC',  sourceUrl: 'https://cnbc.com',         category: 'economy'  as const },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', sourceUrl: 'https://marketwatch.com', category: 'markets' as const },
  { url: 'https://oilprice.com/rss/main', source: 'OilPrice.com',                  sourceUrl: 'https://oilprice.com',     category: 'oil'      as const },
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',  source: 'CNBC Business', sourceUrl: 'https://cnbc.com', category: 'business' as const },
]

async function fetchAllSources(category?: string): Promise<NewsItem[]> {
  const tasks: Promise<NewsItem[]>[] = []

  // RSS sources
  const feeds = category
    ? RSS_FEEDS.filter(f => f.category === category)
    : RSS_FEEDS

  for (const f of feeds) {
    if (!CONFIG.news.reuters     && f.source === 'Reuters')       continue
    if (!CONFIG.news.cnbc        && f.source.startsWith('CNBC'))  continue
    if (!CONFIG.news.marketwatch && f.source === 'MarketWatch')   continue
    if (!CONFIG.news.oilprice    && f.source === 'OilPrice.com')  continue
    tasks.push(fetchRSS(f.url, f.source, f.sourceUrl, f.category, 10))
  }

  if (CONFIG.news.yahoo       && !category)                        tasks.push(Yahoo.fetchLatest())
  if (CONFIG.news.wsj         && (!category || category === 'markets' || category === 'business')) tasks.push(WSJ.fetchLatest())
  if (CONFIG.news.ft          && (!category || category === 'markets'))                            tasks.push(FT.fetchLatest())
  if (CONFIG.news.twitter     && !category)                        tasks.push(X.fetchLatest())

  const results = await Promise.allSettled(tasks)
  const all: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }
  return all
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.title.slice(0, 60).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category  = searchParams.get('category') ?? undefined
  const ticker    = searchParams.get('ticker')   ?? undefined
  const sentiment = searchParams.get('sentiment') ?? undefined   // bullish|bearish|neutral
  const source    = searchParams.get('source')   ?? undefined
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '40'), 80)

  const cacheKey = `news:${category ?? 'all'}:${ticker ?? ''}:${sentiment ?? ''}:${source ?? ''}`
  const cached = getCache<{ articles: NewsItem[]; updatedAt: string }>(cacheKey)
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600', 'X-Cache': 'HIT' },
    })
  }

  let articles = await fetchAllSources(category)

  if (articles.length === 0) {
    articles = getMockNews()
  }

  // Deduplicate
  articles = dedupe(articles)

  // Filter by ticker watchlist
  if (ticker) {
    const tickers = ticker.split(',').map(t => t.trim().toUpperCase())
    articles = articles.filter(a =>
      a.symbols.some(s => tickers.includes(s)) ||
      tickers.some(t => a.title.toLowerCase().includes(t.toLowerCase()))
    )
  }

  // Filter by sentiment
  if (sentiment && sentiment !== 'all') {
    articles = articles.filter(a => a.sentimentLabel === sentiment)
  }

  // Filter by source
  if (source && source !== 'all') {
    articles = articles.filter(a =>
      a.source.toLowerCase().includes(source.toLowerCase())
    )
  }

  // Sort by date descending
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const payload = { articles: articles.slice(0, limit), updatedAt: new Date().toISOString(), source: 'live' }
  setCache(cacheKey, payload, CONFIG.cache.newsTtl)

  return Response.json(payload, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}

function getMockNews(): NewsItem[] {
  return [
    {
      id: 'mock-1', source: 'Reuters', sourceUrl: 'https://reuters.com',
      title: 'WTI Crude Surges 7% as Strait of Hormuz Tensions Escalate',
      summary: 'West Texas Intermediate crude jumped nearly 7% to around $88.48/barrel after Iran reimposed strict controls over the Strait of Hormuz.',
      url: '#', publishedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      category: 'oil', symbols: ['CL=F', 'BZ=F'],
      sentiment: 0.6, sentimentLabel: 'bullish',
    },
    {
      id: 'mock-2', source: 'MarketWatch', sourceUrl: 'https://marketwatch.com',
      title: 'S&P 500 Futures Slide as Iran Tensions Escalate, Oil Prices Spike',
      summary: 'U.S. stock index futures fell as crude oil surged on escalating Middle East tensions.',
      url: '#', publishedAt: new Date(Date.now() - 60 * 60000).toISOString(),
      category: 'markets', symbols: ['^GSPC', 'CL=F'],
      sentiment: -0.4, sentimentLabel: 'bearish',
    },
    {
      id: 'mock-3', source: 'CNBC', sourceUrl: 'https://cnbc.com',
      title: 'Federal Reserve Holds Rates Steady, Eyes Data-Dependent Path',
      summary: 'The Federal Reserve held its benchmark interest rate steady and signaled it needs more evidence that inflation is cooling.',
      url: '#', publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      category: 'economy', symbols: ['^GSPC', '^IXIC', 'GC=F'],
      sentiment: 0.0, sentimentLabel: 'neutral',
    },
    {
      id: 'mock-4', source: 'OilPrice.com', sourceUrl: 'https://oilprice.com',
      title: 'OPEC+ Considers Emergency Production Cut Amid Price Volatility',
      summary: 'OPEC+ ministers are in informal discussions about an emergency meeting to address volatile oil markets.',
      url: '#', publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      category: 'oil', symbols: ['CL=F', 'BZ=F', 'XLE'],
      sentiment: 0.5, sentimentLabel: 'bullish',
    },
    {
      id: 'mock-5', source: 'Reuters', sourceUrl: 'https://reuters.com',
      title: 'Gulf States Announce Record Oil Infrastructure Investment',
      summary: 'Saudi Arabia and UAE unveiled a combined $180 billion investment plan to expand oil production capacity.',
      url: '#', publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      category: 'oil', symbols: ['CL=F', 'BZ=F'],
      sentiment: 0.7, sentimentLabel: 'bullish',
    },
    {
      id: 'mock-6', source: 'CNBC', sourceUrl: 'https://cnbc.com',
      title: 'Natural Gas Prices Fall as U.S. Output Hits Record High',
      summary: 'Henry Hub natural gas futures dropped to a 3-month low as U.S. production reaches record levels.',
      url: '#', publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      category: 'oil', symbols: ['NG=F'],
      sentiment: -0.3, sentimentLabel: 'bearish',
    },
    {
      id: 'mock-7', source: 'MarketWatch', sourceUrl: 'https://marketwatch.com',
      title: 'Major Banks Report Surging Trading Revenue in Q1',
      summary: 'Goldman Sachs and Morgan Stanley reported blowout first-quarter results driven by commodities trading.',
      url: '#', publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      category: 'business', symbols: ['^GSPC', '^IXIC'],
      sentiment: 0.6, sentimentLabel: 'bullish',
    },
    {
      id: 'mock-8', source: 'OilPrice.com', sourceUrl: 'https://oilprice.com',
      title: 'EIA Reports Surprise Crude Draw of 3.2 Million Barrels',
      summary: 'The Energy Information Administration reported a larger-than-expected draw in US crude oil inventories.',
      url: '#', publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      category: 'oil', symbols: ['CL=F', 'BZ=F', 'XLE'],
      sentiment: 0.55, sentimentLabel: 'bullish',
    },
  ]
}
