'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Handshake, ListOrdered, DollarSign,
  ArrowRight, Plus, AlertCircle, Newspaper, BarChart2,
  Globe, Activity, Zap, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { formatBarrels, formatCurrency, formatRelativeTime, DEAL_STATUS_MAP, PRODUCT_TYPES } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DashboardData {
  myListings: number
  myDeals: number
  dealsValue: number
  recentListings: any[]
  recentDeals: any[]
  unreadNotifications: number
}

interface PriceTick {
  label: string
  value: string
  change: string
  pct: string
  up: boolean
  href: string
  tooltip: string
}

const TICKERS: PriceTick[] = [
  { label: 'Brent',      value: '$84.12',  change: '+0.67', pct: '+0.80%', up: true,  href: '/markets', tooltip: 'ICE Brent Crude — global oil benchmark. Price in USD per barrel.' },
  { label: 'WTI',        value: '$80.45',  change: '+0.53', pct: '+0.66%', up: true,  href: '/markets', tooltip: 'NYMEX WTI Light Sweet Crude — US benchmark. USD per barrel.' },
  { label: 'Dubai Crude',value: '$82.30',  change: '+0.61', pct: '+0.74%', up: true,  href: '/markets', tooltip: 'Dubai/Oman average — main benchmark for Gulf crude sold to Asia.' },
  { label: 'Nat Gas',    value: '$2.847',  change: '-0.032', pct: '-1.11%', up: false, href: '/markets', tooltip: 'NYMEX Henry Hub Natural Gas. USD per MMBtu (million British thermal units).' },
  { label: 'Gasoil',     value: '$744.0',  change: '+5.25', pct: '+0.71%', up: true,  href: '/markets', tooltip: 'ICE Gas Oil (diesel) front month. USD per metric tonne.' },
  { label: 'TD3C',       value: 'WS 72.5', change: '+11.0', pct: '+18%',  up: true,  href: '/markets', tooltip: 'VLCC tanker freight rate: Ras Tanura→Chiba (Japan). Worldscale points.' },
  { label: 'Hi-5 Spread',value: '$83.5',   change: '-1.8',  pct: '-2.1%', up: false, href: '/markets', tooltip: 'Fuel Oil spread: HFO 380 vs VLSFO 0.5%S at Fujairah. IMO 2020 scrubber economics.' },
  { label: 'DXY',        value: '104.32',  change: '-0.21', pct: '-0.20%', up: false, href: '/markets', tooltip: 'US Dollar Index. Stronger USD = cheaper for USD-earners to sell oil = bearish for prices.' },
]

const MARKET_ALERTS = [
  { type: 'breaking', text: 'Saudi Aramco cuts Arab Light OSP by $0.10/bbl to Asia for June', time: '6m ago', href: '/news' },
  { type: 'high',     text: 'China April crude imports hit 11.4M bpd — highest since Oct 2023', time: '2h ago', href: '/news' },
  { type: 'medium',   text: 'VLCC TD3C freight surges 18% on tight Arabian Gulf tonnage', time: '5h ago', href: '/news' },
]

interface TooltipProps { text: string; children: React.ReactNode }
function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="group relative inline-block">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-56 rounded-lg bg-[#1c1c26] border border-white/10 p-2.5 text-[11px] text-zinc-300 shadow-xl leading-relaxed">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1c1c26]" />
      </span>
    </span>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { lang } = useLangStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const t = (k: string) => translate(k, lang)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = [
    { label: t('listings'), value: data?.myListings ?? 0, icon: ListOrdered, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/listings', tooltip: 'Total active listings you have posted on the platform.' },
    { label: t('deals'), value: data?.myDeals ?? 0, icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/deals', tooltip: 'Total deals you are party to — across all pipeline stages.' },
    { label: 'Deal Value', value: data?.dealsValue ? formatCurrency(data.dealsValue) : '$0', icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-500/10', href: '/deals', tooltip: 'Approximate combined value of all contracted/closed deals.' },
    { label: 'Alerts', value: data?.unreadNotifications ?? 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/profile', tooltip: 'Unread notifications — deal updates, new messages, document actions.' },
  ]

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Live ticker strip */}
      <div className="rounded-xl border border-white/5 bg-[#13131b] overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Activity size={11} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400">LIVE MARKETS</span>
          </div>
          <Link href="/markets" className="ms-auto text-[10px] text-[#F5A623] hover:underline flex items-center gap-1">
            Full chart view <ArrowRight size={10} />
          </Link>
        </div>
        <div className="flex overflow-x-auto">
          {TICKERS.map(tick => (
            <Tooltip key={tick.label} text={tick.tooltip}>
              <Link
                href={tick.href}
                className="flex flex-col items-start px-4 py-2.5 border-r border-white/5 last:border-0 hover:bg-white/3 transition-all shrink-0 cursor-pointer"
              >
                <span className="text-[10px] text-zinc-500 font-medium">{tick.label}</span>
                <span className="text-sm font-bold font-mono text-zinc-100 mt-0.5">{tick.value}</span>
                <span className={cn('text-[11px] font-mono font-semibold flex items-center gap-0.5', tick.up ? 'text-emerald-400' : 'text-red-400')}>
                  {tick.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {tick.pct}
                </span>
              </Link>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Welcome + quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? `مرحباً، ${session?.user.name}` : `Good morning, ${session?.user.name?.split(' ')[0]}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Brent at <span className="text-[#F5A623] font-semibold">$84.12</span> · Dubai at <span className="text-[#F5A623] font-semibold">$82.30</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/news">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Newspaper size={14} /> News
            </button>
          </Link>
          <Link href="/markets">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
              <BarChart2 size={14} /> Markets
            </button>
          </Link>
          <Link href="/listings/new">
            <button className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#e09610] text-black font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">
              <Plus size={14} /> {t('newListing')}
            </button>
          </Link>
        </div>
      </div>

      {/* Market alerts */}
      <div className="space-y-2">
        {MARKET_ALERTS.map((alert, i) => (
          <Link key={i} href={alert.href}>
            <div className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs transition-all hover:border-white/20',
              alert.type === 'breaking' ? 'bg-red-500/5 border-red-500/20' :
              alert.type === 'high' ? 'bg-amber-500/5 border-amber-500/15' :
              'bg-white/3 border-white/5',
            )}>
              {alert.type === 'breaking' && <Zap size={12} className="text-red-400 shrink-0 animate-pulse" />}
              {alert.type === 'high' && <AlertCircle size={12} className="text-amber-400 shrink-0" />}
              {alert.type === 'medium' && <Globe size={12} className="text-blue-400 shrink-0" />}
              <span className={cn(
                'flex-1 font-medium',
                alert.type === 'breaking' ? 'text-red-300' :
                alert.type === 'high' ? 'text-amber-300' : 'text-zinc-300',
              )}>{alert.text}</span>
              <span className="flex items-center gap-1 text-zinc-600 shrink-0">
                <Clock size={10} /> {alert.time}
              </span>
              <ArrowRight size={12} className="text-zinc-600 shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href, tooltip }) => (
          <Tooltip key={label} text={tooltip}>
            <Link href={href}>
              <Card className="hover:border-gold-500/30 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={cn('text-2xl font-bold', color)}>{loading ? '—' : value}</p>
                    </div>
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                      <Icon size={18} className={color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Tooltip>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Listings */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">{lang === 'ar' ? 'آخر القوائم' : 'Recent Listings'}</CardTitle>
            <Link href="/listings" className="text-[#F5A623] hover:text-[#e09610] text-xs flex items-center gap-1">
              {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight size={12} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)
            ) : data?.recentListings?.length ? (
              data.recentListings.map((l: any) => (
                <Link key={l.id} href={`/listings/${l.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold border shrink-0', PRODUCT_TYPES[l.type]?.color)}>
                      {PRODUCT_TYPES[l.type]?.en ?? l.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatBarrels(l.quantity)} · {l.origin}</p>
                    </div>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0', l.side === 'SELL' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20')}>
                      {l.side}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <ListOrdered size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No listings yet</p>
                <Link href="/listings/new" className="text-[#F5A623] text-xs hover:underline mt-1 inline-block">
                  {t('newListing')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">{lang === 'ar' ? 'آخر الصفقات' : 'Active Deals'}</CardTitle>
            <Link href="/deals" className="text-[#F5A623] hover:text-[#e09610] text-xs flex items-center gap-1">
              {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight size={12} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)
            ) : data?.recentDeals?.length ? (
              data.recentDeals.map((d: any) => {
                const statusInfo = DEAL_STATUS_MAP[d.status]
                return (
                  <Link key={d.id} href={`/deals/${d.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <Handshake size={15} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{d.listing?.title ?? 'Deal'}</p>
                        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(d.createdAt)}</p>
                      </div>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0', statusInfo?.color)}>
                        {lang === 'ar' ? statusInfo?.ar : statusInfo?.en}
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-8">
                <Handshake size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">{t('noDeals')}</p>
                <Link href="/listings" className="text-[#F5A623] text-xs hover:underline mt-1 inline-block">
                  Browse listings
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right panel: OSP + Quick links */}
        <div className="space-y-4">
          {/* Today's OSP snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe size={14} className="text-[#F5A623]" />
                Gulf OSP (May 2026)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                { grade: 'Arab Light', osp: '-$0.10', diff: 'vs Oman/Dubai avg', up: false, tooltip: 'Saudi Aramco OSP for Arab Light to Asian buyers. Negative = discount to Oman/Dubai benchmark average.' },
                { grade: 'Murban',     osp: '+$1.45', diff: 'vs ICE Murban',     up: true,  tooltip: 'ADNOC Murban OSP for May. Premium over ICE Murban Futures settlement price.' },
                { grade: 'Basra Light',osp: '-$0.80', diff: 'vs Oman/Dubai avg', up: false, tooltip: 'SOMO Iraq Basra Light OSP for Asian buyers. Priced vs Oman/Dubai average.' },
                { grade: 'Kuwait Exp', osp: '-$0.35', diff: 'vs Oman/Dubai avg', up: false, tooltip: 'KPC Kuwait Export Crude OSP for Asian buyers.' },
                { grade: 'Oman Blend', osp: 'MO avg', diff: 'Oman/Dubai index',  up: true,  tooltip: 'Oman Blend prices off the Oman/Dubai average published by S&P Global Platts.' },
              ].map(g => (
                <Tooltip key={g.grade} text={g.tooltip}>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 cursor-help">
                    <div>
                      <p className="text-xs font-medium text-foreground">{g.grade}</p>
                      <p className="text-[10px] text-muted-foreground">{g.diff}</p>
                    </div>
                    <span className={cn('text-xs font-bold font-mono underline decoration-dotted', g.up ? 'text-emerald-400' : 'text-red-400')}>
                      {g.osp}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </CardContent>
          </Card>

          {/* Quick navigation */}
          <Card className="border-[#F5A623]/10 bg-[#F5A623]/3">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-bold text-[#F5A623] mb-3">Quick Access</p>
              {[
                { href: '/markets', icon: BarChart2, label: 'Live Markets & Charts' },
                { href: '/news', icon: Newspaper, label: 'Oil Intelligence News' },
                { href: '/listings/new', icon: Plus, label: 'Post New Listing' },
                { href: '/brokers', icon: Handshake, label: 'Find Brokers' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Icon size={14} className="text-[#F5A623] shrink-0" />
                    <span className="text-xs text-foreground">{label}</span>
                    <ArrowRight size={11} className="ms-auto text-zinc-600" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
