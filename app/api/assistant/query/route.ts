import { NextRequest } from 'next/server'
import type { AssistantRequest, AssistantResponse, NewsItem, EconomicEvent } from '@/lib/types'
import { CONFIG } from '@/lib/config'
import { getCache, setCache } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory rate limiter keyed by IP
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimiter.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (entry.count >= CONFIG.rateLimit.assistantReqsPerMin) return false
  entry.count++
  return true
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
}

async function fetchContextData(tickers: string[], timeWindow = '24h'): Promise<{
  news: NewsItem[]
  events: EconomicEvent[]
}> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const newsUrl     = tickers.length
    ? `${base}/api/news?ticker=${tickers.join(',')}&limit=20`
    : `${base}/api/news?limit=15`
  const calendarUrl = `${base}/api/calendar`

  const [newsRes, calRes] = await Promise.allSettled([
    fetch(newsUrl,     { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
    fetch(calendarUrl, { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
  ])

  return {
    news:   newsRes.status  === 'fulfilled' ? (newsRes.value as { articles: NewsItem[] }).articles ?? []  : [],
    events: calRes.status   === 'fulfilled' ? (calRes.value  as { events:  EconomicEvent[] }).events ?? [] : [],
  }
}

function buildSystemPrompt(): string {
  return `You are OilDesk AI, a financial market intelligence assistant for OilDesk — a professional energy and global markets terminal.

Your role:
- Provide concise, actionable market summaries
- Focus on oil, energy, macro, and equities
- Reference the provided news and calendar data as primary sources
- Always include a disclaimer

Constraints:
- Do NOT give specific buy/sell/hold recommendations
- Do NOT predict specific price targets
- Keep responses focused and under 400 words
- Always end with the standard disclaimer

Response format (JSON):
{
  "summary": "2-3 sentence executive summary",
  "bullets": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "links": [{"title": "...", "url": "...", "source": "..."}],
  "calendarEvents": [{"title": "...", "date": "...", "impact": "high|medium|low"}],
  "confidence": 0.0-1.0,
  "disclaimer": "${CONFIG.disclaimer}"
}`
}

function buildUserPrompt(
  prompt: string,
  tickers: string[],
  news: NewsItem[],
  events: EconomicEvent[],
): string {
  const newsContext = news.slice(0, 12).map(n =>
    `[${n.source}] ${n.title} (${n.sentimentLabel}, ${n.publishedAt.slice(0, 10)})\n  ${n.summary.slice(0, 150)}\n  URL: ${n.url}`
  ).join('\n\n')

  const calContext = events.slice(0, 6).map(e =>
    `${e.date.slice(0, 16)} UTC — ${e.title} [${e.country}] Impact: ${e.impact} | Forecast: ${e.forecast ?? 'N/A'} | Prev: ${e.previous ?? 'N/A'}`
  ).join('\n')

  return `USER QUERY: ${prompt}
${tickers.length ? `TICKERS OF INTEREST: ${tickers.join(', ')}` : ''}

RECENT NEWS CONTEXT:
${newsContext || 'No news available.'}

UPCOMING ECONOMIC EVENTS:
${calContext || 'No calendar events available.'}

Respond in the JSON format specified in the system prompt.`
}

// Lightweight moderation: block obvious harmful prompts
function moderatePrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  const blocked = ['ignore previous', 'jailbreak', 'system prompt', 'act as', 'dan mode', 'forget your instructions']
  return !blocked.some(b => lower.includes(b))
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })
  }

  let body: AssistantRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { prompt = '', tickers = [], timeWindow = '24h' } = body

  if (!prompt.trim()) {
    return Response.json({ error: 'prompt is required' }, { status: 400 })
  }

  if (!moderatePrompt(prompt)) {
    return Response.json({ error: 'Query not permitted.' }, { status: 400 })
  }

  // Cache by prompt + tickers hash
  const cacheKey = `assistant:${Buffer.from(prompt + tickers.join('')).toString('base64').slice(0, 24)}`
  const cached = getCache<AssistantResponse>(cacheKey)
  if (cached) return Response.json(cached)

  const apiKey = CONFIG.anthropic.apiKey
  if (!apiKey) {
    return Response.json(getMockAssistantResponse(prompt, tickers))
  }

  // Fetch context
  const { news, events } = await fetchContextData(tickers, timeWindow)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CONFIG.anthropic.timeoutMs)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      CONFIG.anthropic.model,
        max_tokens: CONFIG.anthropic.maxTokens,
        system:     buildSystemPrompt(),
        messages:   [{ role: 'user', content: buildUserPrompt(prompt, tickers, news, events) }],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic API error:', err)
      return Response.json(getMockAssistantResponse(prompt, tickers))
    }

    const data = await res.json() as {
      content: Array<{ type: string; text: string }>
    }

    const text = data.content.find(c => c.type === 'text')?.text ?? '{}'
    let parsed: AssistantResponse
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {
        summary: text.slice(0, 300),
        bullets: [text.slice(0, 200)],
        links: news.slice(0, 3).map(n => ({ title: n.title, url: n.url, source: n.source })),
        calendarEvents: events.slice(0, 2).map(e => ({ title: e.title, date: e.date, impact: e.impact })),
        disclaimer: CONFIG.disclaimer,
        confidence: 0.7,
        generatedAt: new Date().toISOString(),
      }
    }

    parsed.generatedAt = new Date().toISOString()
    setCache(cacheKey, parsed, CONFIG.cache.assistantTtl)
    return Response.json(parsed)

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return Response.json({ error: 'Assistant timed out. Try a shorter query.' }, { status: 504 })
    }
    return Response.json(getMockAssistantResponse(prompt, tickers))
  } finally {
    clearTimeout(timeout)
  }
}

function getMockAssistantResponse(prompt: string, tickers: string[]): AssistantResponse {
  const isOil     = tickers.some(t => ['CL=F', 'BZ=F', 'NG=F', 'XLE'].includes(t)) || prompt.toLowerCase().includes('oil')
  const isMacro   = prompt.toLowerCase().includes('macro') || prompt.toLowerCase().includes('fed')
  const isBrief   = prompt.toLowerCase().includes('brief') || prompt.toLowerCase().includes('morning')

  const summary = isOil
    ? 'Oil markets remain elevated with WTI above $87 and Brent near $91 amid Middle East supply concerns and a larger-than-expected EIA inventory draw. OPEC+ compliance remains a key watchpoint.'
    : isMacro
    ? 'Macro backdrop remains mixed: Fed holds rates steady with a data-dependent posture while CPI prints above target. Equity markets are rangebound as investors weigh rate path uncertainty against resilient earnings.'
    : isBrief
    ? 'Markets open cautiously higher. Oil leading gains on Hormuz tension and inventory draws. Equities mixed ahead of CPI data. Gold testing resistance at $3,350. Dollar slightly firmer.'
    : 'Market conditions remain dynamic with energy sector leading gains. Key catalysts include upcoming EIA inventory data, FOMC minutes, and geopolitical developments in the Middle East.'

  return {
    summary,
    bullets: [
      isOil ? 'WTI Crude +6.8% on Hormuz supply concerns — watch $90 resistance' : 'S&P 500 holding 5,600 support — breadth improving',
      'EIA crude inventory draw of -3.2M barrels exceeded forecast of -1.2M',
      'OPEC+ monitoring compliance; emergency meeting discussions ongoing',
      'Fed minutes due Wednesday — markets pricing 2 cuts in H2 2026',
      'Baker Hughes rig count declines for 3rd consecutive week',
    ],
    links: [
      { title: 'WTI Crude Surges on Hormuz Tensions', url: '#', source: 'Reuters' },
      { title: 'OPEC+ Emergency Meeting Discussions', url: '#', source: 'OilPrice.com' },
      { title: 'EIA Weekly Petroleum Status Report', url: 'https://www.eia.gov/petroleum/supply/weekly/', source: 'EIA' },
    ],
    calendarEvents: [
      { title: 'EIA Crude Oil Inventories', date: new Date(Date.now() + 86400000).toISOString(), impact: 'high' },
      { title: 'FOMC Meeting Minutes', date: new Date(Date.now() + 3 * 86400000).toISOString(), impact: 'high' },
    ],
    disclaimer: CONFIG.disclaimer,
    confidence: 0.62,
    generatedAt: new Date().toISOString(),
  }
}
