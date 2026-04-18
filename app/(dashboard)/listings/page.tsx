'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Plus, Droplets, Gauge, MapPin, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import {
  cn, formatBarrels, formatRelativeTime,
  PRODUCT_TYPES, ORIGINS, getSulfurLabel, getApiLabel,
} from '@/lib/utils'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import type { ListingWithUser } from '@/types'

const TYPES = ['', 'CRUDE_OIL', 'FUEL_OIL', 'GASOIL', 'JET_A1', 'LPG', 'BITUMEN', 'NAPHTHA']

export default function ListingsPage() {
  const { lang } = useLangStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = (k: string) => translate(k, lang)

  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? '')
  const [originFilter, setOriginFilter] = useState(searchParams.get('origin') ?? '')
  const [sideFilter, setSideFilter] = useState(searchParams.get('side') ?? '')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (typeFilter) params.set('type', typeFilter)
    if (originFilter) params.set('origin', originFilter)
    if (sideFilter) params.set('side', sideFilter)
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings ?? [])
    setLoading(false)
  }, [search, typeFilter, originFilter, sideFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('listings')}</h1>
          <p className="text-muted-foreground text-sm">
            {listings.length} {lang === 'ar' ? 'قائمة نشطة' : 'active listings'}
          </p>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-bold px-4 py-2 rounded-lg transition-colors text-sm">
            <Plus size={15} /> {t('newListing')}
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={lang === 'ar' ? 'بحث في القوائم...' : 'Search listings...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-8 h-9 text-sm"
          />
        </div>

        {/* Side filter */}
        <div className="flex rounded-lg border border-[hsl(var(--border))] overflow-hidden">
          {['', 'SELL', 'BUY'].map(s => (
            <button
              key={s}
              onClick={() => setSideFilter(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                sideFilter === s ? 'bg-gold-500 text-black' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === '' ? t('allTypes') : s === 'SELL' ? t('sell') : t('buy')}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground"
        >
          <option value="">{t('allTypes')}</option>
          {TYPES.slice(1).map(tp => (
            <option key={tp} value={tp}>{PRODUCT_TYPES[tp]?.en}</option>
          ))}
        </select>

        {/* Origin filter */}
        <select
          value={originFilter}
          onChange={e => setOriginFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground"
        >
          <option value="">{t('allOrigins')}</option>
          {Object.entries(ORIGINS).map(([key, val]) => (
            <option key={key} value={key}>{val.flag} {lang === 'ar' ? val.ar : val.en}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد قوائم مطابقة' : 'No listings found'}</p>
          <Link href="/listings/new" className="text-gold-400 text-sm hover:underline mt-2 inline-block">
            {t('newListing')}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListingCard({ listing, lang }: { listing: ListingWithUser; lang: string }) {
  const t = (k: string) => translate(k, lang as any)
  const origin = ORIGINS[listing.origin]
  const productType = PRODUCT_TYPES[listing.type]

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:border-gold-500/30 transition-all hover:shadow-lg hover:shadow-gold-500/5 cursor-pointer group h-full">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', productType?.color)}>
                {lang === 'ar' ? productType?.ar : productType?.en}
              </span>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded border',
                listing.side === 'SELL'
                  ? 'text-green-400 bg-green-500/10 border-green-500/20'
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              )}>
                {listing.side === 'SELL' ? t('sell') : t('buy')}
              </span>
            </div>
            {listing.user?.isVerified && <VerifiedBadge />}
          </div>

          {/* Title */}
          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-gold-400 transition-colors line-clamp-1">
              {listing.title}
            </h3>
            {listing.grade && (
              <p className="text-xs text-muted-foreground mt-0.5">{listing.grade}</p>
            )}
          </div>

          {/* Specs row */}
          <div className="flex flex-wrap gap-2">
            {listing.apiGravity && (() => {
              const { label, color } = getApiLabel(listing.apiGravity)
              return (
                <div className="flex items-center gap-1 text-[10px]">
                  <Gauge size={10} className={color} />
                  <span className="text-muted-foreground">API</span>
                  <span className={cn('font-semibold', color)}>{listing.apiGravity}°</span>
                  <span className={cn('text-[9px]', color)}>({label})</span>
                </div>
              )
            })()}
            {listing.sulfurContent != null && (() => {
              const { label, color } = getSulfurLabel(listing.sulfurContent)
              return (
                <div className="flex items-center gap-1 text-[10px]">
                  <Droplets size={10} className={color} />
                  <span className="text-muted-foreground">S</span>
                  <span className={cn('font-semibold', color)}>{listing.sulfurContent}%</span>
                  <span className={cn('text-[9px]', color)}>({label})</span>
                </div>
              )
            })()}
          </div>

          {/* Details */}
          <div className="space-y-1.5 pt-1 border-t border-[hsl(var(--border))]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={11} />
                <span>{origin ? `${origin.flag} ${lang === 'ar' ? origin.ar : origin.en}` : listing.origin}</span>
              </div>
              <span className="text-foreground font-medium">{formatBarrels(listing.quantity)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{listing.incoterms} · {listing.loadingPort ?? '—'}</span>
              <span>{formatRelativeTime(listing.createdAt)}</span>
            </div>
          </div>

          {/* Price & action */}
          <div className="flex items-center justify-between pt-1">
            <div>
              {listing.priceType === 'NEGOTIABLE' || !listing.priceValue ? (
                <span className="text-xs text-gold-400 font-medium">{t('negotiable')}</span>
              ) : (
                <span className="text-xs font-semibold text-foreground">
                  ${listing.priceValue}/BBL
                </span>
              )}
            </div>
            <button className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1">
              {t('sendInquiry')} →
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
