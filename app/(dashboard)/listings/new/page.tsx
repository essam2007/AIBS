'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { PRODUCT_TYPES, ORIGINS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Droplets, Gauge, FlaskConical, ChevronRight, ChevronLeft } from 'lucide-react'

type Step = 'basics' | 'specs' | 'logistics' | 'pricing'
const STEPS: Step[] = ['basics', 'specs', 'logistics', 'pricing']

export default function NewListingPage() {
  const { lang } = useLangStore()
  const router = useRouter()
  const { data: session } = useSession()
  const t = (k: string) => translate(k, lang)
  const [step, setStep] = useState<Step>('basics')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '', titleAr: '', type: 'CRUDE_OIL', side: 'SELL',
    origin: 'Saudi Arabia', grade: '', refinery: '',
    quantity: '', minQuantity: '',
    incoterms: 'FOB', loadingPort: '', deliveryPort: '',
    deliveryStart: '', deliveryEnd: '', vesselType: '',
    priceType: 'NEGOTIABLE', priceValue: '', currency: 'USD',
    apiGravity: '', sulfurContent: '', viscosity: '', waterContent: '',
    ashContent: '', pourPoint: '', flashPoint: '', rvp: '',
    h2sContent: '', totalAcidNumber: '', waxContent: '',
    niContent: '', vaContent: '',
    description: '', descriptionAr: '', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const stepIndex = STEPS.indexOf(step)
  const isLast = stepIndex === STEPS.length - 1

  const stepLabels: Record<Step, { en: string; ar: string }> = {
    basics:    { en: 'Product Basics',      ar: 'أساسيات المنتج' },
    specs:     { en: 'Chemical Specs',      ar: 'المواصفات الكيميائية' },
    logistics: { en: 'Logistics',           ar: 'اللوجستيات' },
    pricing:   { en: 'Pricing & Notes',     ar: 'التسعير والملاحظات' },
  }

  async function submit() {
    setSaving(true)
    setError('')
    try {
      const body = { ...form }
      const numFields = ['quantity', 'minQuantity', 'priceValue', 'apiGravity', 'sulfurContent',
        'viscosity', 'waterContent', 'ashContent', 'pourPoint', 'flashPoint', 'rvp',
        'h2sContent', 'totalAcidNumber', 'waxContent', 'niContent', 'vaContent']
      numFields.forEach(f => {
        if ((body as any)[f] === '') (body as any)[f] = undefined
        else if ((body as any)[f]) (body as any)[f] = parseFloat((body as any)[f])
      })
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to create listing')
        return
      }
      const { id } = await res.json()
      router.push(`/listings/${id}`)
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold">{t('newListing')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === 'ar' ? 'أدخل تفاصيل منتجك النفطي' : 'Enter the details of your oil product'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              onClick={() => i < stepIndex && setStep(s)}
              className={cn(
                'flex flex-col items-center gap-1 flex-1',
                i <= stepIndex ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                i < stepIndex ? 'bg-gold-500 border-gold-500 text-black'
                  : i === stepIndex ? 'border-gold-500 text-gold-400'
                  : 'border-border text-muted-foreground'
              )}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={cn('text-[9px] hidden sm:block', i === stepIndex ? 'text-gold-400' : 'text-muted-foreground')}>
                {lang === 'ar' ? stepLabels[s].ar : stepLabels[s].en}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 flex-1 mb-4', i < stepIndex ? 'bg-gold-500' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === 'ar' ? stepLabels[step].ar : stepLabels[step].en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'basics' && (
            <>
              {/* Side */}
              <div>
                <Label>{lang === 'ar' ? 'نوع الإعلان' : 'Listing Type'}</Label>
                <div className="flex gap-3 mt-1.5">
                  {[{ v: 'SELL', en: 'Offer to Sell', ar: 'عرض للبيع' }, { v: 'BUY', en: 'Request to Buy', ar: 'طلب شراء' }].map(({ v, en, ar }) => (
                    <button
                      key={v}
                      onClick={() => set('side', v)}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                        form.side === v
                          ? v === 'SELL' ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                          : 'border-border text-muted-foreground hover:border-white/20'
                      )}
                    >
                      {lang === 'ar' ? ar : en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product type */}
              <div>
                <Label>{lang === 'ar' ? 'نوع المنتج' : 'Product Type'} *</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1.5">
                  {Object.entries(PRODUCT_TYPES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => set('type', key)}
                      className={cn(
                        'py-2 px-2 rounded-lg border text-[11px] font-medium transition-colors text-center',
                        form.type === key ? cn(val.color, 'opacity-100') : 'border-border text-muted-foreground hover:border-white/20'
                      )}
                    >
                      {lang === 'ar' ? val.ar : val.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{lang === 'ar' ? 'عنوان الإعلان (إنجليزي)' : 'Listing Title (English)'} *</Label>
                  <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Arab Light Crude - FOB Ras Tanura" className="mt-1" />
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'عنوان الإعلان (عربي)' : 'Listing Title (Arabic)'}</Label>
                  <Input value={form.titleAr} onChange={e => set('titleAr', e.target.value)} placeholder="مثال: نفط عربي خفيف" className="mt-1" dir="rtl" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('origin')} *</Label>
                  <select value={form.origin} onChange={e => set('origin', e.target.value)} className="w-full h-9 mt-1 px-3 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground">
                    {Object.entries(ORIGINS).map(([k, v]) => (
                      <option key={k} value={k}>{v.flag} {v.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{t('grade')} / Blend</Label>
                  <Input value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="Arab Light, Basra Light, ESPO..." className="mt-1" />
                </div>
              </div>

              <div>
                <Label>{lang === 'ar' ? 'المصفاة / المورد' : 'Refinery / Source'}</Label>
                <Input value={form.refinery} onChange={e => set('refinery', e.target.value)} placeholder="Ras Tanura Refinery, Ruwais..." className="mt-1" />
              </div>
            </>
          )}

          {step === 'specs' && (
            <>
              <p className="text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                {lang === 'ar'
                  ? 'المواصفات الكيميائية مهمة جداً. القوائم ذات المواصفات الكاملة تحصل على 3 أضعاف الاستفسارات.'
                  : 'Chemical specs are critical. Listings with complete specs receive 3x more inquiries. All fields optional but recommended.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1"><Gauge size={12} className="text-blue-400" /> API Gravity (°)</Label>
                  <Input type="number" step="0.1" value={form.apiGravity} onChange={e => set('apiGravity', e.target.value)} placeholder="e.g. 34.5 (Light ≥34, Heavy ≤30)" className="mt-1" />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Droplets size={12} className="text-green-400" /> Sulfur Content (% wt)</Label>
                  <Input type="number" step="0.01" value={form.sulfurContent} onChange={e => set('sulfurContent', e.target.value)} placeholder="e.g. 0.18 (Sweet <0.5, Sour >1.0)" className="mt-1" />
                </div>
                <div>
                  <Label>Viscosity (cSt @ 50°C)</Label>
                  <Input type="number" step="0.1" value={form.viscosity} onChange={e => set('viscosity', e.target.value)} placeholder="e.g. 5.2" className="mt-1" />
                </div>
                <div>
                  <Label>Water Content (% vol)</Label>
                  <Input type="number" step="0.01" value={form.waterContent} onChange={e => set('waterContent', e.target.value)} placeholder="e.g. 0.05" className="mt-1" />
                </div>
                <div>
                  <Label>Pour Point (°C)</Label>
                  <Input type="number" value={form.pourPoint} onChange={e => set('pourPoint', e.target.value)} placeholder="e.g. -15" className="mt-1" />
                </div>
                <div>
                  <Label>Flash Point (°C)</Label>
                  <Input type="number" value={form.flashPoint} onChange={e => set('flashPoint', e.target.value)} placeholder="e.g. 60" className="mt-1" />
                </div>
                <div>
                  <Label>RVP (psi)</Label>
                  <Input type="number" step="0.1" value={form.rvp} onChange={e => set('rvp', e.target.value)} placeholder="e.g. 7.2" className="mt-1" />
                </div>
                <div>
                  <Label>H₂S Content (ppm)</Label>
                  <Input type="number" value={form.h2sContent} onChange={e => set('h2sContent', e.target.value)} placeholder="e.g. 50" className="mt-1" />
                </div>
                <div>
                  <Label>TAN (mg KOH/g)</Label>
                  <Input type="number" step="0.01" value={form.totalAcidNumber} onChange={e => set('totalAcidNumber', e.target.value)} placeholder="e.g. 0.12" className="mt-1" />
                </div>
                <div>
                  <Label>Nickel (ppm)</Label>
                  <Input type="number" value={form.niContent} onChange={e => set('niContent', e.target.value)} placeholder="e.g. 12" className="mt-1" />
                </div>
                <div>
                  <Label>Vanadium (ppm)</Label>
                  <Input type="number" value={form.vaContent} onChange={e => set('vaContent', e.target.value)} placeholder="e.g. 28" className="mt-1" />
                </div>
                <div>
                  <Label>Wax Content (%)</Label>
                  <Input type="number" step="0.1" value={form.waxContent} onChange={e => set('waxContent', e.target.value)} placeholder="e.g. 2.1" className="mt-1" />
                </div>
              </div>
            </>
          )}

          {step === 'logistics' && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('quantity')} (BBL) *</Label>
                  <Input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 2000000" className="mt-1" />
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'الحد الأدنى' : 'Min. Quantity'} (BBL)</Label>
                  <Input type="number" value={form.minQuantity} onChange={e => set('minQuantity', e.target.value)} placeholder="e.g. 500000" className="mt-1" />
                </div>
              </div>

              <div>
                <Label>{t('incoterms')} *</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {['FOB', 'CIF', 'CFR', 'DDP', 'DAP', 'EXW'].map(inc => (
                    <button key={inc} onClick={() => set('incoterms', inc)}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                        form.incoterms === inc ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' : 'border-border text-muted-foreground hover:border-white/20'
                      )}>
                      {inc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{lang === 'ar' ? 'ميناء الشحن' : 'Loading Port'}</Label>
                  <Input value={form.loadingPort} onChange={e => set('loadingPort', e.target.value)} placeholder="Ras Tanura, Jebel Ali, Mina Al Ahmadi..." className="mt-1" />
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'ميناء التسليم' : 'Delivery Port'}</Label>
                  <Input value={form.deliveryPort} onChange={e => set('deliveryPort', e.target.value)} placeholder="Rotterdam, Singapore, Fujairah..." className="mt-1" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{lang === 'ar' ? 'بداية التسليم' : 'Delivery Window Start'}</Label>
                  <Input type="date" value={form.deliveryStart} onChange={e => set('deliveryStart', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'نهاية التسليم' : 'Delivery Window End'}</Label>
                  <Input type="date" value={form.deliveryEnd} onChange={e => set('deliveryEnd', e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label>{lang === 'ar' ? 'نوع السفينة' : 'Vessel Type'}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {['VLCC', 'Suezmax', 'Aframax', 'Panamax', 'MR Tanker'].map(v => (
                    <button key={v} onClick={() => set('vesselType', v)}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                        form.vesselType === v ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' : 'border-border text-muted-foreground hover:border-white/20'
                      )}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'pricing' && (
            <>
              <div>
                <Label>{lang === 'ar' ? 'نوع السعر' : 'Pricing Type'}</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { v: 'NEGOTIABLE', en: 'Negotiable', ar: 'قابل للتفاوض' },
                    { v: 'PLATTS_PLUS', en: 'Platts +/-', ar: 'بلاتس +/-' },
                    { v: 'FIXED', en: 'Fixed', ar: 'سعر ثابت' },
                  ].map(({ v, en, ar }) => (
                    <button key={v} onClick={() => set('priceType', v)}
                      className={cn('py-2 rounded-lg border text-xs font-medium transition-colors',
                        form.priceType === v ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' : 'border-border text-muted-foreground'
                      )}>
                      {lang === 'ar' ? ar : en}
                    </button>
                  ))}
                </div>
              </div>

              {form.priceType !== 'NEGOTIABLE' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{lang === 'ar' ? 'القيمة' : 'Price Value'}</Label>
                    <Input type="number" step="0.01" value={form.priceValue} onChange={e => set('priceValue', e.target.value)}
                      placeholder={form.priceType === 'PLATTS_PLUS' ? '+1.25 or -0.50' : '75.50'} className="mt-1" />
                  </div>
                  <div>
                    <Label>{lang === 'ar' ? 'العملة' : 'Currency'}</Label>
                    <select value={form.currency} onChange={e => set('currency', e.target.value)}
                      className="w-full h-9 mt-1 px-3 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground">
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <Label>{lang === 'ar' ? 'وصف إضافي (إنجليزي)' : 'Additional Description (English)'}</Label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Additional details, conditions, or requirements..." className="mt-1" rows={3} />
              </div>
              <div>
                <Label>{lang === 'ar' ? 'وصف إضافي (عربي)' : 'Additional Description (Arabic)'}</Label>
                <Textarea value={form.descriptionAr} onChange={e => set('descriptionAr', e.target.value)}
                  placeholder="تفاصيل أو شروط إضافية..." className="mt-1" rows={3} dir="rtl" />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(STEPS[stepIndex - 1])} disabled={stepIndex === 0}>
          <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          {lang === 'ar' ? 'السابق' : 'Previous'}
        </Button>
        {isLast ? (
          <Button onClick={submit} disabled={saving || !form.title || !form.quantity}>
            {saving ? (lang === 'ar' ? 'جاري النشر...' : 'Publishing...') : (lang === 'ar' ? 'نشر الإعلان' : 'Publish Listing')}
          </Button>
        ) : (
          <Button onClick={() => setStep(STEPS[stepIndex + 1])} disabled={step === 'basics' && !form.title}>
            {lang === 'ar' ? 'التالي' : 'Next'}
            <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </Button>
        )}
      </div>
    </div>
  )
}
