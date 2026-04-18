'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Handshake, ListOrdered, CheckCircle2, Building2, MapPin, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn, formatDate } from '@/lib/utils'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'

interface BrokerStat {
  id: string
  name: string
  nameAr: string | null
  email: string
  country: string
  city: string | null
  isVerified: boolean
  createdAt: string
  company: { name: string; isVerified: boolean } | null
  avgRating: number
  _count: { sellerDeals: number; brokerDeals: number; listings: number }
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-gold-400 fill-gold-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  )
}

export default function BrokersPage() {
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const [brokers, setBrokers] = useState<BrokerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  useEffect(() => {
    fetch('/api/brokers')
      .then(r => r.json())
      .then(d => { setBrokers(d.brokers ?? []); setLoading(false) })
  }, [])

  const countries = ['', 'AE', 'SA', 'KW', 'IQ', 'OM', 'QA', 'BH']
  const countryNames: Record<string, string> = { AE: '🇦🇪 UAE', SA: '🇸🇦 Saudi Arabia', KW: '🇰🇼 Kuwait', IQ: '🇮🇶 Iraq', OM: '🇴🇲 Oman', QA: '🇶🇦 Qatar', BH: '🇧🇭 Bahrain' }

  const filtered = brokers.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.company?.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = !countryFilter || b.country === countryFilter
    return matchSearch && matchCountry
  })

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold">{t('brokers')}</h1>
        <p className="text-muted-foreground text-sm">
          {brokers.length} {lang === 'ar' ? 'وسيط موثق' : 'verified brokers'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={lang === 'ar' ? 'بحث عن وسيط...' : 'Search brokers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-8 h-9 text-sm"
          />
        </div>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground"
        >
          <option value="">{lang === 'ar' ? 'جميع الدول' : 'All Countries'}</option>
          {countries.slice(1).map(c => <option key={c} value={c}>{countryNames[c]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {lang === 'ar' ? 'لا يوجد وسطاء مطابقون' : 'No brokers found'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(broker => (
            <BrokerCard key={broker.id} broker={broker} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}

function BrokerCard({ broker, lang }: { broker: BrokerStat; lang: string }) {
  const totalDeals = (broker._count.sellerDeals ?? 0) + (broker._count.brokerDeals ?? 0)
  const t = (k: string) => translate(k, lang as any)

  return (
    <Link href={`/brokers/${broker.id}`}>
      <Card className="hover:border-gold-500/30 transition-all hover:shadow-lg hover:shadow-gold-500/5 cursor-pointer group h-full">
        <CardContent className="p-4 space-y-3">
          {/* Avatar & name */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-base shrink-0">
              {broker.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground group-hover:text-gold-400 transition-colors truncate">
                  {broker.name}
                </p>
                {broker.isVerified && <CheckCircle2 size={13} className="text-gold-400 shrink-0" />}
              </div>
              {broker.nameAr && (
                <p className="text-xs text-muted-foreground" dir="rtl">{broker.nameAr}</p>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating rating={broker.avgRating ?? 0} />
                <span className="text-[10px] text-muted-foreground">
                  {broker.avgRating ? broker.avgRating.toFixed(1) : lang === 'ar' ? 'لا تقييم' : 'No rating'}
                </span>
              </div>
            </div>
          </div>

          {/* Company */}
          {broker.company && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 size={11} />
              <span className="truncate">{broker.company.name}</span>
              {broker.company.isVerified && <CheckCircle2 size={10} className="text-gold-400 shrink-0" />}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={11} />
            <span>{broker.city ? `${broker.city}, ` : ''}{broker.country}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{totalDeals}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{lang === 'ar' ? 'صفقات' : 'Deals'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{broker._count.listings ?? 0}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{lang === 'ar' ? 'قوائم' : 'Listings'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gold-400">{broker.avgRating ? broker.avgRating.toFixed(1) : '—'}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{lang === 'ar' ? 'تقييم' : 'Rating'}</p>
            </div>
          </div>

          {/* Member since */}
          <p className="text-[10px] text-muted-foreground">
            {t('memberSince')} {formatDate(broker.createdAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
