export interface NewsItem {
  id: string
  source: string
  sourceUrl: string
  title: string
  summary: string
  url: string
  publishedAt: string
  category: 'oil' | 'energy' | 'markets' | 'economy' | 'business' | 'macro' | 'crypto'
  symbols: string[]
  sentiment: number       // -1 to 1
  sentimentLabel: 'bullish' | 'bearish' | 'neutral'
  imageUrl?: string
}

export interface EconomicEvent {
  id: string
  title: string
  country: string
  currency: string
  date: string            // ISO 8601
  impact: 'high' | 'medium' | 'low'
  actual?: string
  forecast?: string
  previous?: string
  unit?: string
  relatedTickers: string[]
  category: string
}

export interface OilMetric {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  unit: string
  timestamp: string
  rolling7d?: number
  rolling30d?: number
  rolling90d?: number
}

export interface EnergyHeadline extends NewsItem {
  oilRelated: true
  benchmark?: 'WTI' | 'Brent' | 'OPEC' | 'NG' | 'other'
}

export interface AssistantRequest {
  prompt: string
  tickers?: string[]
  timeWindow?: string
  sources?: string[]
  sentimentPreference?: 'all' | 'bullish' | 'bearish'
}

export interface AssistantResponse {
  summary: string
  bullets: string[]
  links: Array<{ title: string; url: string; source: string }>
  calendarEvents: Array<{ title: string; date: string; impact: string }>
  disclaimer: string
  confidence: number
  generatedAt: string
}
