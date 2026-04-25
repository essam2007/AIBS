'use client'

import { useState } from 'react'
import { Clock, TrendingUp, TrendingDown, Minus, ExternalLink, Filter, Search, Zap, Globe, BarChart2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: 'supply' | 'demand' | 'geopolitics' | 'opec' | 'refining' | 'freight' | 'macro'
  sentiment: 'bullish' | 'bearish' | 'neutral'
  instruments: string[]
  impact: 'high' | 'medium' | 'low'
  region: string
  isBreaking?: boolean
}

const NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Saudi Aramco Cuts Arab Light OSP to Asia by $0.10/bbl for June Loadings',
    summary: 'Saudi Aramco set its official selling price for Arab Light crude to Asia at a $0.10/bbl discount to the Oman/Dubai average for June, surprising traders who expected a flat or small premium following strong Q1 demand from China. The cut signals Aramco is prioritizing volume share ahead of the summer driving season.',
    source: 'Argus Media',
    sourceUrl: '#',
    publishedAt: '2026-04-25T06:30:00Z',
    category: 'supply',
    sentiment: 'bearish',
    instruments: ['Arab Light', 'Brent', 'Dubai Crude'],
    impact: 'high',
    region: 'Saudi Arabia',
    isBreaking: true,
  },
  {
    id: '2',
    title: 'OPEC+ April Output Cut Compliance Slips to 91% — IEA Survey',
    summary: 'OPEC+ collective compliance with voluntary production cuts fell to 91% in April from 94% in March, according to an IEA secondary source survey. Iraq and Kazakhstan were the main overproducers, with both countries struggling to enforce cuts on independently-run fields and IOC-operated projects.',
    source: 'IEA Oil Market Report',
    sourceUrl: '#',
    publishedAt: '2026-04-25T05:15:00Z',
    category: 'opec',
    sentiment: 'bearish',
    instruments: ['Brent', 'WTI', 'Basra Light'],
    impact: 'high',
    region: 'OPEC+',
  },
  {
    id: '3',
    title: 'China April Crude Imports Rise 6.2% YoY to 11.4M bpd — Customs Data',
    summary: 'China\'s crude oil imports jumped 6.2% year-on-year to 11.4 million barrels per day in April, the highest since October 2023, as independent refiners ("teapots") stockpiled ahead of expected summer processing runs. Russian ESPO and Urals remained the top origins, while Gulf grades Arab Light and Murban saw stronger loadings.',
    source: 'China General Administration of Customs',
    sourceUrl: '#',
    publishedAt: '2026-04-25T04:00:00Z',
    category: 'demand',
    sentiment: 'bullish',
    instruments: ['Brent', 'ESPO', 'Murban', 'Arab Light'],
    impact: 'high',
    region: 'China',
  },
  {
    id: '4',
    title: 'ADNOC Raises Murban OSP by $0.45/bbl for June — Strongest Premium in 8 Months',
    summary: 'Abu Dhabi National Oil Company set the Murban official selling price at a $1.45/bbl premium over ICE Murban Futures for June, up $0.45 from May. The increase reflects strong demand from Asian refiners seeking light, low-sulfur crude to maximize gasoline and naphtha yields ahead of the Asian driving season.',
    source: 'ADNOC Official',
    sourceUrl: '#',
    publishedAt: '2026-04-24T14:20:00Z',
    category: 'supply',
    sentiment: 'bullish',
    instruments: ['Murban', 'Naphtha', 'Gasoline'],
    impact: 'medium',
    region: 'UAE',
  },
  {
    id: '5',
    title: 'VLCC TD3C Freight Rate Surges 18% on Limited Tonnage Availability in AG',
    summary: 'The Baltic Exchange TD3C VLCC route (Ras Tanura to Chiba) surged to WS 72.5 from WS 61.5 a week ago, driven by tight tanker availability in the Arabian Gulf after a wave of dry dock entries and increased fixture activity. Shipbrokers expect rates to remain elevated through May.',
    source: 'Baltic Exchange',
    sourceUrl: '#',
    publishedAt: '2026-04-24T11:45:00Z',
    category: 'freight',
    sentiment: 'bullish',
    instruments: ['TD3C', 'VLCC', 'Arab Light'],
    impact: 'medium',
    region: 'Arabian Gulf',
  },
  {
    id: '6',
    title: 'US EIA Reports 3.2M Bbl Crude Draw — Fourth Consecutive Weekly Decline',
    summary: 'US commercial crude oil inventories fell by 3.2 million barrels in the week ending April 18, according to EIA data, beating consensus estimates of a 1.5M bbl draw. Cushing stocks dropped to 23.4M bbl, near 5-year seasonal lows. Gasoline builds of 1.1M bbl partially offset the bullish crude print.',
    source: 'US Energy Information Administration',
    sourceUrl: '#',
    publishedAt: '2026-04-23T15:30:00Z',
    category: 'supply',
    sentiment: 'bullish',
    instruments: ['WTI', 'Gasoline', 'Distillates'],
    impact: 'high',
    region: 'United States',
  },
  {
    id: '7',
    title: 'Iraq Signs 10-Year Crude Supply Agreement with Indian IOC for 200K bpd',
    summary: 'Iraq\'s SOMO signed a long-term crude supply deal with Indian Oil Corporation for 200,000 bpd starting January 2027. The deal covers a mix of Basra Light and Basra Medium grades, with pricing indexed to the Oman/Dubai average plus a formula OSP differential. India is Iraq\'s largest single crude buyer.',
    source: 'SOMO Press Release',
    sourceUrl: '#',
    publishedAt: '2026-04-23T09:00:00Z',
    category: 'supply',
    sentiment: 'neutral',
    instruments: ['Basra Light', 'Basra Medium'],
    impact: 'medium',
    region: 'Iraq',
  },
  {
    id: '8',
    title: 'Fujairah Fuel Oil Stocks Rise 4.8% to 10.1M Bbl — Highest Since February',
    summary: 'Fuel oil inventories at Fujairah, UAE rose 4.8% week-on-week to 10.1 million barrels, the highest level since early February, according to the Fujairah Oil Industry Zone (FOIZ). The build reflects slower bunker demand and elevated imports from Russia and Singapore. VLSFO crack spreads narrowed on the news.',
    source: 'Fujairah Oil Industry Zone',
    sourceUrl: '#',
    publishedAt: '2026-04-22T08:00:00Z',
    category: 'supply',
    sentiment: 'bearish',
    instruments: ['HFO 380', 'VLSFO', 'Hi-5 Spread'],
    impact: 'medium',
    region: 'UAE',
  },
  {
    id: '9',
    title: 'Libya Force Majeure at Es Sider Port Lifts; 1M bbl Cargo Resumes Loading',
    summary: 'The National Oil Corporation of Libya lifted force majeure at the Es Sider export terminal after a 9-day outage caused by protests. A cargo of approximately 1 million barrels of Es Sider crude is now loading, with first discharge expected at a European refinery in mid-May.',
    source: 'Libya NOC',
    sourceUrl: '#',
    publishedAt: '2026-04-22T07:15:00Z',
    category: 'supply',
    sentiment: 'bearish',
    instruments: ['Brent', 'Es Sider'],
    impact: 'medium',
    region: 'Libya',
  },
  {
    id: '10',
    title: 'Federal Reserve Signals Pause — Oil Markets Price in Demand Resilience',
    summary: 'Federal Reserve minutes from the April FOMC meeting showed unanimous agreement to hold rates steady through at least Q2 2026, with two members advocating cuts before year-end. The dollar weakened 0.4% on the news, providing a tailwind for dollar-denominated oil prices. Brent gained $0.90/bbl on the session.',
    source: 'Federal Reserve',
    sourceUrl: '#',
    publishedAt: '2026-04-21T19:00:00Z',
    category: 'macro',
    sentiment: 'bullish',
    instruments: ['Brent', 'WTI', 'DXY'],
    impact: 'medium',
    region: 'United States',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'supply', label: 'Supply' },
  { id: 'demand', label: 'Demand' },
  { id: 'opec', label: 'OPEC+' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'freight', label: 'Freight' },
  { id: 'refining', label: 'Refining' },
  { id: 'macro', label: 'Macro' },
]

const SENTIMENT_CONFIG = {
  bullish:  { icon: TrendingUp,   color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Bullish' },
  bearish:  { icon: TrendingDown, color: 'text-red-400 bg-red-400/10 border-red-400/20',             label: 'Bearish' },
  neutral:  { icon: Minus,        color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',           label: 'Neutral' },
}

const IMPACT_COLOR = {
  high:   'bg-red-500/20 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  low:    'bg-zinc-500/20 text-zinc-400 border-zinc-500/20',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const MARKET_SNAPSHOT = [
  { label: 'Brent', value: '$84.12', change: '+0.80%', up: true },
  { label: 'WTI',   value: '$80.45', change: '+0.66%', up: true },
  { label: 'Dubai', value: '$82.30', change: '+0.74%', up: true },
  { label: 'Nat Gas', value: '$2.85', change: '-1.11%', up: false },
  { label: 'TD3C', value: 'WS 72.5', change: '+18%', up: true },
  { label: 'Hi-5', value: '$83.5', change: '-2.1%', up: false },
]

export default function NewsPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = NEWS.filter(n => {
    const matchCat = category === 'all' || n.category === category
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const breaking = filtered.find(n => n.isBreaking)
  const rest = filtered.filter(n => !n.isBreaking)

  return (
    <div className="max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe size={22} className="text-[#F5A623]" /> Oil Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time Gulf & global energy market news
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F5A623]/50 w-48"
            />
          </div>
        </div>
      </div>

      {/* Live market snapshot strip */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-[#13131b] border border-white/5 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-400">LIVE</span>
        </div>
        {MARKET_SNAPSHOT.map(m => (
          <div key={m.label} className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded bg-white/5">
            <span className="text-[11px] text-zinc-500">{m.label}</span>
            <span className="text-[11px] font-mono font-semibold text-zinc-200">{m.value}</span>
            <span className={cn('text-[11px] font-mono', m.up ? 'text-emerald-400' : 'text-red-400')}>{m.change}</span>
          </div>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border',
              category === cat.id
                ? 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/30'
                : 'text-muted-foreground border-white/10 hover:text-foreground hover:bg-white/5',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Main news feed */}
        <div className="lg:col-span-2 space-y-3">

          {/* Breaking news */}
          {breaking && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">
                  <Zap size={10} className="animate-pulse" /> BREAKING
                </span>
                <span className="text-[11px] text-zinc-500">{timeAgo(breaking.publishedAt)} · {breaking.source}</span>
              </div>
              <h2 className="text-base font-bold text-foreground mb-2 leading-snug">{breaking.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{breaking.summary}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {breaking.instruments.map(inst => (
                  <span key={inst} className="text-[10px] px-2 py-0.5 rounded bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 font-medium">
                    {inst}
                  </span>
                ))}
                <span className={cn('text-[10px] px-2 py-0.5 rounded border font-medium', IMPACT_COLOR[breaking.impact])}>
                  {breaking.impact.toUpperCase()} IMPACT
                </span>
              </div>
            </div>
          )}

          {/* Rest of news */}
          {rest.map(item => {
            const Sentiment = SENTIMENT_CONFIG[item.sentiment]
            const SentIcon = Sentiment.icon
            const isOpen = expanded === item.id
            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[hsl(var(--card))] overflow-hidden hover:border-white/10 transition-all"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border', Sentiment.color)}>
                          <SentIcon size={9} /> {Sentiment.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">{item.source}</span>
                        <span className="text-[10px] text-zinc-600">·</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Clock size={9} /> {timeAgo(item.publishedAt)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 capitalize">{item.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>
                    </div>
                    <ChevronRight size={16} className={cn('text-zinc-600 shrink-0 mt-1 transition-transform', isOpen && 'rotate-90')} />
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-[10px] text-zinc-600">Instruments:</span>
                        {item.instruments.map(inst => (
                          <span key={inst} className="text-[10px] px-2 py-0.5 rounded bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20">
                            {inst}
                          </span>
                        ))}
                        <span className={cn('ms-auto text-[10px] px-2 py-0.5 rounded border', IMPACT_COLOR[item.impact])}>
                          {item.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No news matching your filters.
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* OSP Calendar */}
          <div className="rounded-xl border border-white/5 bg-[hsl(var(--card))] p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">OSP Release Calendar</h3>
            <div className="space-y-2">
              {[
                { producer: 'Saudi Aramco', product: 'Arab grades', date: 'May 5, 2026', status: 'upcoming' },
                { producer: 'ADNOC', product: 'Murban, Das, ADCO', date: 'May 1, 2026', status: 'upcoming' },
                { producer: 'KPC', product: 'Kuwait Export', date: 'May 3, 2026', status: 'upcoming' },
                { producer: 'SOMO', product: 'Basra grades', date: 'Apr 28, 2026', status: 'upcoming' },
                { producer: 'QatarEnergy', product: 'Qatar Marine/Land', date: 'May 4, 2026', status: 'upcoming' },
              ].map(osp => (
                <div key={osp.producer} className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-foreground">{osp.producer}</p>
                    <p className="text-[10px] text-muted-foreground">{osp.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400">{osp.date}</p>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key events */}
          <div className="rounded-xl border border-white/5 bg-[hsl(var(--card))] p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Upcoming Events</h3>
            <div className="space-y-2.5">
              {[
                { date: 'Apr 29', event: 'EIA Weekly Petroleum Status Report', type: 'inventory' },
                { date: 'May 2',  event: 'OPEC+ JMC Virtual Meeting', type: 'opec' },
                { date: 'May 5',  event: 'Saudi Aramco May OSP Release', type: 'osp' },
                { date: 'May 8',  event: 'IEA Oil Market Report (May)', type: 'report' },
                { date: 'May 12', event: 'OPEC Monthly Oil Market Report', type: 'report' },
                { date: 'May 20', event: 'API Weekly Crude Inventories', type: 'inventory' },
              ].map(ev => (
                <div key={ev.event} className="flex gap-3 items-start">
                  <div className="w-10 shrink-0 text-center">
                    <span className="text-[10px] font-bold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded block">{ev.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug">{ev.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst consensus */}
          <div className="rounded-xl border border-white/5 bg-[hsl(var(--card))] p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Analyst Consensus</h3>
            {[
              { bank: 'Goldman Sachs', target: '$90/bbl', horizon: 'Q3 2026', bias: 'bullish' },
              { bank: 'JP Morgan',     target: '$87/bbl', horizon: 'Q3 2026', bias: 'bullish' },
              { bank: 'Citigroup',     target: '$75/bbl', horizon: 'Q3 2026', bias: 'bearish' },
              { bank: 'Morgan Stanley', target: '$85/bbl', horizon: 'Q3 2026', bias: 'neutral' },
            ].map(a => (
              <div key={a.bank} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-xs font-medium text-foreground">{a.bank}</p>
                  <p className="text-[10px] text-muted-foreground">{a.horizon}</p>
                </div>
                <span className={cn('text-[11px] font-bold font-mono',
                  a.bias === 'bullish' ? 'text-emerald-400' : a.bias === 'bearish' ? 'text-red-400' : 'text-zinc-300',
                )}>
                  {a.target}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
