'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp, Handshake, ListOrdered, DollarSign,
  ArrowRight, Clock, CheckCircle2, AlertCircle, Plus,
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
    { label: t('listings'), value: data?.myListings ?? 0, icon: ListOrdered, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/listings' },
    { label: t('deals'), value: data?.myDeals ?? 0, icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/deals' },
    { label: t('dealsClosedLabel'), value: data?.dealsValue ? formatCurrency(data.dealsValue) : '$0', icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-500/10', href: '/deals' },
    { label: 'Notifications', value: data?.unreadNotifications ?? 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/profile' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? `مرحباً، ${session?.user.name}` : `Welcome back, ${session?.user.name}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === 'ar' ? 'إليك ملخص نشاطك اليوم' : "Here's your activity summary"}
          </p>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2 rounded-lg transition-colors text-sm">
            <Plus size={16} /> {t('newListing')}
          </button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-gold-500/30 transition-colors cursor-pointer">
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
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">{lang === 'ar' ? 'آخر القوائم' : 'Recent Listings'}</CardTitle>
            <Link href="/listings" className="text-gold-400 hover:text-gold-300 text-xs flex items-center gap-1">
              {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight size={12} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)
            ) : data?.recentListings?.length ? (
              data.recentListings.map((l: any) => (
                <Link key={l.id} href={`/listings/${l.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', PRODUCT_TYPES[l.type]?.color)}>
                      {PRODUCT_TYPES[l.type]?.en ?? l.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatBarrels(l.quantity)} · {l.origin}</p>
                    </div>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', l.side === 'SELL' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20')}>
                      {l.side}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <ListOrdered size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'لا توجد قوائم بعد' : 'No listings yet'}</p>
                <Link href="/listings/new" className="text-gold-400 text-xs hover:underline mt-1 inline-block">
                  {t('newListing')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">{lang === 'ar' ? 'آخر الصفقات' : 'Recent Deals'}</CardTitle>
            <Link href="/deals" className="text-gold-400 hover:text-gold-300 text-xs flex items-center gap-1">
              {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight size={12} className={lang === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)
            ) : data?.recentDeals?.length ? (
              data.recentDeals.map((d: any) => {
                const statusInfo = DEAL_STATUS_MAP[d.status]
                return (
                  <Link key={d.id} href={`/deals/${d.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <Handshake size={16} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{d.listing?.title ?? 'Deal'}</p>
                        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(d.createdAt)}</p>
                      </div>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', statusInfo?.color)}>
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
                <Link href="/listings" className="text-gold-400 text-xs hover:underline mt-1 inline-block">
                  {lang === 'ar' ? 'تصفح القوائم' : 'Browse listings'}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick tips */}
      <Card className="border-gold-500/20 bg-gold-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-gold-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-gold-400">
                {lang === 'ar' ? 'نصيحة: كيف تغلق صفقاتك بنجاح' : 'Pro Tip: How to close deals faster'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar'
                  ? 'القوائم التي تتضمن مواصفات كيميائية كاملة (API، كبريت، لزوجة) تحصل على 3 أضعاف الاستفسارات.'
                  : 'Listings with complete chemical specs (API, sulfur, viscosity) receive 3x more inquiries. Add your SGS assay to build buyer confidence.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
