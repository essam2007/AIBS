'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Handshake, ArrowRight, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn, formatRelativeTime, formatBarrels, DEAL_STATUS_MAP, PRODUCT_TYPES } from '@/lib/utils'
import type { DealWithRelations } from '@/types'

export default function DealsPage() {
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const [deals, setDeals] = useState<DealWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/deals').then(r => r.json()).then(d => { setDeals(d.deals ?? []); setLoading(false) })
  }, [])

  const statuses = ['ALL', 'INQUIRY', 'NEGOTIATION', 'CONTRACTED', 'CLOSED', 'FAILED']
  const filtered = filter === 'ALL' ? deals : deals.filter(d => d.status === filter)

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold">{t('deals')}</h1>
        <p className="text-muted-foreground text-sm">{deals.length} {lang === 'ar' ? 'صفقة إجمالاً' : 'total deals'}</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              filter === s ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' : 'border-border text-muted-foreground hover:border-white/20'
            )}>
            {s === 'ALL' ? (lang === 'ar' ? 'الكل' : 'All') : (lang === 'ar' ? DEAL_STATUS_MAP[s]?.ar : DEAL_STATUS_MAP[s]?.en)}
            {s !== 'ALL' && <span className="ms-1.5 text-[10px] opacity-60">{deals.filter(d => d.status === s).length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Handshake size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t('noDeals')}</p>
          <Link href="/listings" className="text-gold-400 text-sm hover:underline mt-2 inline-block">
            {lang === 'ar' ? 'تصفح القوائم' : 'Browse listings'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(deal => {
            const statusInfo = DEAL_STATUS_MAP[deal.status]
            const pt = PRODUCT_TYPES[deal.listing?.type]
            return (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
                <Card className="hover:border-gold-500/30 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                        <Handshake size={17} className="text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-gold-400 transition-colors line-clamp-1">
                              {deal.listing?.title ?? 'Deal'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {pt && <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', pt.color)}>{pt.en}</span>}
                              {deal.listing?.origin && <span className="text-[10px] text-muted-foreground">{deal.listing.origin}</span>}
                              {deal.agreedQuantity && <span className="text-[10px] text-muted-foreground">{formatBarrels(deal.agreedQuantity)}</span>}
                            </div>
                          </div>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0', statusInfo?.color)}>
                            {lang === 'ar' ? statusInfo?.ar : statusInfo?.en}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle size={10} />
                            {deal.messages?.length ?? 0} {lang === 'ar' ? 'رسائل' : 'messages'}
                          </span>
                          <span>{formatRelativeTime(deal.updatedAt)}</span>
                          <ArrowRight size={11} className={cn('ms-auto text-gold-400/60 group-hover:text-gold-400 transition-colors', lang === 'ar' && 'rotate-180')} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
