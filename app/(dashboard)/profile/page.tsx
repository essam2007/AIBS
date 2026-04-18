'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Save, User, Building2, Phone, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'IQ', name: 'Iraq', nameAr: 'العراق' },
  { code: 'OM', name: 'Oman', nameAr: 'عُمان' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين' },
]

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', nameAr: '', phone: '', whatsapp: '', city: '', country: 'AE' })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile(d)
        setForm({
          name: d.name ?? '',
          nameAr: d.nameAr ?? '',
          phone: d.phone ?? '',
          whatsapp: d.whatsapp ?? '',
          city: d.city ?? '',
          country: d.country ?? 'AE',
        })
      })
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await update()
    }
    setSaving(false)
  }

  const kycColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    APPROVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
  }
  const kycLabels: Record<string, { en: string; ar: string }> = {
    PENDING: { en: 'KYC Pending', ar: 'في انتظار التحقق' },
    APPROVED: { en: 'KYC Verified', ar: 'تم التحقق' },
    REJECTED: { en: 'KYC Rejected', ar: 'تم الرفض' },
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">{t('profile')}</h1>
        <p className="text-muted-foreground text-sm">{lang === 'ar' ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}</p>
      </div>

      {/* Status banner */}
      <div className="flex flex-wrap gap-3">
        <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border',
          profile?.isVerified ? 'text-gold-400 bg-gold-500/10 border-gold-500/20' : 'text-muted-foreground border-border'
        )}>
          {profile?.isVerified
            ? (lang === 'ar' ? '✓ وسيط موثق' : '✓ Verified Broker')
            : (lang === 'ar' ? 'غير موثق' : 'Not Verified')}
        </span>
        {profile?.kycStatus && (
          <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border', kycColors[profile.kycStatus])}>
            {lang === 'ar' ? kycLabels[profile.kycStatus]?.ar : kycLabels[profile.kycStatus]?.en}
          </span>
        )}
        <span className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">
          {profile?.role}
        </span>
      </div>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User size={15} className="text-gold-400" />
            {lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Full Name (English)'}</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{lang === 'ar' ? 'الاسم (عربي)' : 'Full Name (Arabic)'}</Label>
              <Input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} className="mt-1" dir="rtl" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Phone size={12} /> {t('phone')}</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <span className="text-green-400 text-xs">💬</span>
                {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
              </Label>
              <Input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
            </div>
            <div>
              <Label>{t('country')}</Label>
              <select value={form.country} onChange={e => set('country', e.target.value)}
                className="w-full h-9 mt-1 px-3 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground">
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{lang === 'ar' ? c.nameAr : c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{lang === 'ar' ? 'المدينة' : 'City'}</Label>
              <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Dubai, Riyadh, Kuwait City..." className="mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">{t('email')}: {profile?.email}</p>
            <Button onClick={save} disabled={saving}>
              {saved
                ? <><CheckCircle2 size={14} className="me-1.5 text-emerald-400" />{lang === 'ar' ? 'تم الحفظ' : 'Saved!'}</>
                : <><Save size={14} className="me-1.5" />{t('save')}</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company info */}
      {profile?.company && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 size={15} className="text-gold-400" />
              {t('company')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{profile.company.name}</span>
              {profile.company.isVerified && <CheckCircle2 size={14} className="text-gold-400" />}
            </div>
            {profile.company.registrationNo && (
              <p className="text-muted-foreground text-xs">CR: {profile.company.registrationNo}</p>
            )}
            {profile.company.country && (
              <p className="text-muted-foreground text-xs">{profile.company.country}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* KYC tip */}
      {profile?.kycStatus === 'PENDING' && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4 text-sm">
            <p className="text-yellow-400 font-semibold mb-1">
              {lang === 'ar' ? '⏳ التحقق من الهوية قيد المراجعة' : '⏳ KYC Verification Pending'}
            </p>
            <p className="text-muted-foreground text-xs">
              {lang === 'ar'
                ? 'فريقنا يراجع مستنداتك. بعد التحقق ستحصل على شارة "وسيط موثق" وصلاحيات كاملة.'
                : 'Our team is reviewing your documents. After verification you will receive a Verified Broker badge and full platform access.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
