'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, CheckCircle2, Building2, MapPin,
  Handshake, ListOrdered, Phone, Mail, MessageCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn, formatDate, formatBarrels } from '@/lib/utils'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-gold-400 fill-gold-400' : 'text-muted-foreground/30'} />
      ))}
      <span className="text-sm font-semibold text-foreground ms-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function BrokerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const [broker, setBroker] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/brokers/${id}`)
      .then(r => r.json())
      .then(d => { setBroker(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="max-w-3xl space-y-4">
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
      <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
    </div>
  )

  if (!broker) return <div className="text-muted-foreground py-16 text-center">{lang === 'ar' ? 'الوسيط غير موجود' : 'Broker not found'}</div>

  const totalDeals = (broker._count?.sellerDeals ?? 0) + (broker._count?.brokerDeals ?? 0)

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/brokers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
        {lang === 'ar' ? 'العودة للوسطاء' : 'Back to Brokers'}
      </Link>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-2xl shrink-0">
              {broker.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{broker.name}</h1>
                {broker.isVerified && <VerifiedBadge />}
                <span className="text-xs px-2 py-0.5 rounded border border-border text-muted-foreground">{broker.role}</span>
              </div>
              {broker.nameAr && <p className="text-muted-foreground text-sm mt-0.5" dir="rtl">{broker.nameAr}</p>}
              {broker.avgRating > 0 && (
                <div className="mt-2">
                  <StarRating rating={broker.avgRating} />
                </div>
              )}
            </div>
          </div>

          {/* Company */}
          {broker.company && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              <Building2 size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">{broker.company.name}</span>
              {broker.company.isVerified && <CheckCircle2 size={13} className="text-gold-400" />}
              {broker.company.country && <span className="text-xs text-muted-foreground">· {broker.company.country}</span>}
            </div>
          )}

          {/* Contact & location */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {broker.city && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                <span>{broker.city}, {broker.country}</span>
              </div>
            )}
            {broker.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={13} />
                <span>{broker.phone}</span>
              </div>
            )}
            {broker.whatsapp && (
              <div className="flex items-center gap-1.5">
                <MessageCircle size={13} className="text-green-400" />
                <span>{broker.whatsapp}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Mail size={13} />
              <span>{broker.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: lang === 'ar' ? 'إجمالي الصفقات' : 'Total Deals', value: totalDeals, icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: lang === 'ar' ? 'القوائم' : 'Listings', value: broker._count?.listings ?? 0, icon: ListOrdered, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: lang === 'ar' ? 'التقييم' : 'Rating', value: broker.avgRating ? broker.avgRating.toFixed(1) : '—', icon: Star, color: 'text-gold-400', bg: 'bg-gold-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2', bg)}>
                <Icon size={18} className={color} />
              </div>
              <p className={cn('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ratings breakdown */}
      {broker.ratingsRcvd?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{lang === 'ar' ? 'التقييمات' : 'Reviews'} ({broker.ratingsRcvd.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avg breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: lang === 'ar' ? 'الموثوقية' : 'Reliability', key: 'reliability' },
                { label: lang === 'ar' ? 'السرعة' : 'Speed', key: 'speed' },
                { label: lang === 'ar' ? 'الخبرة' : 'Expertise', key: 'expertise' },
                { label: lang === 'ar' ? 'الإجمالي' : 'Overall', key: 'score' },
              ].map(({ label, key }) => {
                const avg = broker.ratingsRcvd.reduce((s: number, r: any) => s + (r[key] ?? 0), 0) / broker.ratingsRcvd.length
                return (
                  <div key={key} className="text-center bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-gold-400">{avg.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-gold-500 rounded-full" style={{ width: `${(avg / 5) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Individual reviews */}
            <div className="space-y-3">
              {broker.ratingsRcvd.slice(0, 5).map((r: any) => (
                <div key={r.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className={s <= r.score ? 'text-gold-400 fill-gold-400' : 'text-muted-foreground/30'} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member since */}
      <p className="text-xs text-muted-foreground text-center">
        {t('memberSince')} {formatDate(broker.createdAt)}
      </p>
    </div>
  )
}
