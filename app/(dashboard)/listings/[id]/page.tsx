'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Droplets, Gauge, MapPin, Ship, Calendar, FileText,
  ArrowLeft, Handshake, User, Building2, CheckCircle2,
  Flame, Thermometer, FlaskConical, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import {
  cn, formatBarrels, formatDate, formatRelativeTime,
  PRODUCT_TYPES, ORIGINS, DEAL_STATUS_MAP, getSulfurLabel, getApiLabel,
} from '@/lib/utils'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import type { ListingWithUser } from '@/types'

interface ListingDetail extends ListingWithUser {
  documents: any[]
  deals: any[]
  _count: { deals: number }
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const { lang } = useLangStore()
  const router = useRouter()
  const t = (k: string) => translate(k, lang)

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [inquiring, setInquiring] = useState(false)
  const [showFullSpecs, setShowFullSpecs] = useState(false)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState('')
  const [showInquiryForm, setShowInquiryForm] = useState(false)

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(d => { setListing(d); setLoading(false) })
  }, [id])

  const isOwner = session?.user?.id === listing?.userId

  async function sendInquiry() {
    if (!message.trim()) return
    setInquiring(true)
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id, message, quantity: quantity ? parseFloat(quantity) : undefined }),
    })
    if (res.ok) {
      const { id: dealId } = await res.json()
      router.push(`/deals/${dealId}`)
    }
    setInquiring(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!listing) {
    return <div className="text-muted-foreground text-center py-16">{lang === 'ar' ? 'القائمة غير موجودة' : 'Listing not found'}</div>
  }

  const origin = ORIGINS[listing.origin]
  const productType = PRODUCT_TYPES[listing.type]

  return (
    <div className="max-w-4xl space-y-5">
      {/* Back */}
      <Link href="/listings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
        {lang === 'ar' ? 'العودة للقوائم' : 'Back to Listings'}
      </Link>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded border', productType?.color)}>
                    {lang === 'ar' ? productType?.ar : productType?.en}
                  </span>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded border',
                    listing.side === 'SELL' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  )}>
                    {listing.side === 'SELL' ? t('sell') : t('buy')}
                  </span>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded border',
                    listing.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-muted-foreground border-border'
                  )}>
                    {listing.status}
                  </span>
                </div>
                {listing.user?.isVerified && <VerifiedBadge />}
              </div>

              <div>
                <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
                {listing.titleAr && <p className="text-muted-foreground mt-0.5" dir="rtl">{listing.titleAr}</p>}
                {listing.grade && <p className="text-sm text-gold-400 mt-1 font-medium">{listing.grade}</p>}
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('quantity')}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formatBarrels(listing.quantity)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('incoterms')}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{listing.incoterms}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('origin')}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {origin ? `${origin.flag} ${lang === 'ar' ? origin.ar : origin.en}` : listing.origin}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('price')}</p>
                  <p className="text-sm font-bold text-gold-400 mt-0.5">
                    {listing.priceType === 'NEGOTIABLE' || !listing.priceValue
                      ? t('negotiable')
                      : `$${listing.priceValue}/BBL`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chemical Specs */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FlaskConical size={15} className="text-gold-400" />
                  {t('specifications')}
                </CardTitle>
                <button onClick={() => setShowFullSpecs(!showFullSpecs)} className="text-xs text-muted-foreground flex items-center gap-1">
                  {showFullSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showFullSpecs ? (lang === 'ar' ? 'أقل' : 'Less') : (lang === 'ar' ? 'المزيد' : 'More')}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.apiGravity != null && (() => {
                  const { label, color } = getApiLabel(listing.apiGravity!)
                  return (
                    <SpecRow icon={<Gauge size={14} className={color} />} label="API Gravity" value={`${listing.apiGravity}°`} sub={label} subColor={color} />
                  )
                })()}
                {listing.sulfurContent != null && (() => {
                  const { label, color } = getSulfurLabel(listing.sulfurContent!)
                  return (
                    <SpecRow icon={<Droplets size={14} className={color} />} label={t('sulfurContent')} value={`${listing.sulfurContent}%`} sub={label} subColor={color} />
                  )
                })()}
                {listing.viscosity != null && <SpecRow icon={<FlaskConical size={14} className="text-purple-400" />} label="Viscosity" value={`${listing.viscosity} cSt`} />}
                {listing.waterContent != null && <SpecRow label="Water Content" value={`${listing.waterContent}%`} />}
                {showFullSpecs && (<>
                  {listing.pourPoint != null && <SpecRow icon={<Thermometer size={14} className="text-blue-400" />} label="Pour Point" value={`${listing.pourPoint}°C`} />}
                  {listing.flashPoint != null && <SpecRow icon={<Flame size={14} className="text-red-400" />} label="Flash Point" value={`${listing.flashPoint}°C`} />}
                  {listing.rvp != null && <SpecRow label="RVP" value={`${listing.rvp} psi`} />}
                  {listing.h2sContent != null && <SpecRow label="H₂S" value={`${listing.h2sContent} ppm`} />}
                  {listing.totalAcidNumber != null && <SpecRow label="TAN" value={`${listing.totalAcidNumber} mg KOH/g`} />}
                  {listing.niContent != null && <SpecRow label="Nickel" value={`${listing.niContent} ppm`} />}
                  {listing.vaContent != null && <SpecRow label="Vanadium" value={`${listing.vaContent} ppm`} />}
                  {listing.waxContent != null && <SpecRow label="Wax" value={`${listing.waxContent}%`} />}
                </>)}
              </div>
              {!listing.apiGravity && !listing.sulfurContent && (
                <p className="text-xs text-muted-foreground text-center py-4">{lang === 'ar' ? 'لم يتم إضافة مواصفات كيميائية' : 'No chemical specifications provided'}</p>
              )}
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Ship size={15} className="text-blue-400" /> {lang === 'ar' ? 'اللوجستيات' : 'Logistics'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listing.loadingPort && <SpecRow icon={<MapPin size={14} className="text-green-400" />} label={lang === 'ar' ? 'ميناء الشحن' : 'Loading Port'} value={listing.loadingPort} />}
              {listing.deliveryPort && <SpecRow icon={<MapPin size={14} className="text-blue-400" />} label={lang === 'ar' ? 'ميناء التسليم' : 'Delivery Port'} value={listing.deliveryPort} />}
              {listing.vesselType && <SpecRow icon={<Ship size={14} className="text-purple-400" />} label={lang === 'ar' ? 'السفينة' : 'Vessel'} value={listing.vesselType} />}
              {listing.deliveryStart && <SpecRow icon={<Calendar size={14} className="text-gold-400" />} label={lang === 'ar' ? 'بداية التسليم' : 'Delivery Start'} value={formatDate(listing.deliveryStart)} />}
              {listing.deliveryEnd && <SpecRow label={lang === 'ar' ? 'نهاية التسليم' : 'Delivery End'} value={formatDate(listing.deliveryEnd)} />}
              {listing.minQuantity && <SpecRow label={lang === 'ar' ? 'الحد الأدنى' : 'Min. Qty'} value={formatBarrels(listing.minQuantity)} />}
            </CardContent>
          </Card>

          {listing.description && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{lang === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{listing.description}</p>
                {listing.descriptionAr && <p className="text-sm text-muted-foreground mt-2 border-t border-border pt-2" dir="rtl">{listing.descriptionAr}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Seller card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold">
                  {listing.user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{listing.user?.name}</p>
                    {listing.user?.isVerified && <CheckCircle2 size={13} className="text-gold-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{listing.user?.role} · {listing.user?.country}</p>
                </div>
              </div>
              {listing.company && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-2">
                  <Building2 size={12} />
                  <span>{listing.company.name}</span>
                  {listing.company.isVerified && <CheckCircle2 size={11} className="text-gold-400" />}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'نشر' : 'Posted'} {formatRelativeTime(listing.createdAt)}</p>
            </CardContent>
          </Card>

          {/* Inquiry */}
          {!isOwner && (
            <Card className="border-gold-500/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gold-400">
                  {lang === 'ar' ? 'إرسال استفسار' : 'Send Inquiry'}
                </h3>
                {!showInquiryForm ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'تواصل مع البائع وابدأ المفاوضات' : 'Contact the seller and start negotiations in a secure deal room.'}
                    </p>
                    <Button className="w-full" onClick={() => setShowInquiryForm(true)}>
                      <Handshake size={15} className="me-2" /> {t('sendInquiry')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">{lang === 'ar' ? 'الكمية المطلوبة (BBL)' : 'Desired Quantity (BBL)'}</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        placeholder={lang === 'ar' ? 'اختياري' : 'Optional'}
                        className="w-full mt-1 h-8 px-3 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{lang === 'ar' ? 'رسالتك' : 'Your Message'} *</label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={lang === 'ar' ? 'مرحباً، أنا مهتم بهذا العرض...' : 'Hello, I am interested in this listing...'}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-foreground resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowInquiryForm(false)}>
                        {t('cancel')}
                      </Button>
                      <Button className="flex-1" onClick={sendInquiry} disabled={inquiring || !message.trim()}>
                        {inquiring ? '...' : t('submit')}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'هذا إعلانك' : 'This is your listing'}</p>
                <p className="text-sm font-semibold text-foreground">
                  {listing._count?.deals ?? 0} {lang === 'ar' ? 'استفسار' : 'inquiries'}
                </p>
                <Link href="/listings">
                  <Button variant="outline" className="w-full text-xs">{lang === 'ar' ? 'إدارة القوائم' : 'Manage Listings'}</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {listing.documents?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText size={13} className="text-gold-400" />
                  {t('documents')} ({listing.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {listing.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground p-2 rounded hover:bg-white/5 transition-colors">
                    <FileText size={12} className="text-gold-400 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                    {doc.isVerified && <CheckCircle2 size={11} className="text-gold-400 shrink-0" />}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function SpecRow({ icon, label, value, sub, subColor }: {
  icon?: React.ReactNode; label: string; value: string; sub?: string; subColor?: string
}) {
  return (
    <div className="bg-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className={cn('text-[10px] mt-0.5', subColor ?? 'text-muted-foreground')}>{sub}</p>}
    </div>
  )
}
