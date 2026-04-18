'use client'

import { type ChangeEvent, type FormEvent, type ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { toast } from '@/lib/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'BROKER' | 'BUYER' | 'SELLER'

interface FormData {
  name: string
  nameAr: string
  email: string
  password: string
  confirmPassword: string
  role: Role | ''
  phone: string
  country: string
  companyName: string
}

const INITIAL_FORM: FormData = {
  name: '',
  nameAr: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  phone: '',
  country: '',
  companyName: '',
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES: { value: Role; en: string; ar: string }[] = [
  { value: 'BROKER', en: 'Broker', ar: 'وسيط' },
  { value: 'BUYER',  en: 'Buyer',  ar: 'مشتري' },
  { value: 'SELLER', en: 'Seller', ar: 'بائع' },
]

const COUNTRIES: { value: string; en: string; ar: string; flag: string }[] = [
  { value: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { value: 'SA', en: 'Saudi Arabia',          ar: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { value: 'KW', en: 'Kuwait',                ar: 'الكويت',                  flag: '🇰🇼' },
  { value: 'IQ', en: 'Iraq',                  ar: 'العراق',                  flag: '🇮🇶' },
  { value: 'OM', en: 'Oman',                  ar: 'عُمان',                   flag: '🇴🇲' },
  { value: 'QA', en: 'Qatar',                 ar: 'قطر',                     flag: '🇶🇦' },
  { value: 'BH', en: 'Bahrain',               ar: 'البحرين',                 flag: '🇧🇭' },
]

// ── Field row helper ──────────────────────────────────────────────────────────
function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const lang = useLangStore((s) => s.lang)
  const t = (key: string) => translate(key, lang)

  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function fieldChange(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => update(key, e.target.value)
  }

  // Client-side validation
  function validate(): string | null {
    if (form.name.trim().length < 2)
      return lang === 'en' ? 'Full name must be at least 2 characters.' : 'الاسم يجب أن يكون حرفين على الأقل.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return lang === 'en' ? 'Please enter a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.'
    if (form.password.length < 8)
      return lang === 'en' ? 'Password must be at least 8 characters.' : 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
    if (form.password !== form.confirmPassword)
      return lang === 'en' ? 'Passwords do not match.' : 'كلمتا المرور غير متطابقتين.'
    if (!form.role)
      return lang === 'en' ? 'Please select your role.' : 'يرجى اختيار دورك.'
    if (!form.country)
      return lang === 'en' ? 'Please select your country.' : 'يرجى اختيار دولتك.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      toast({
        variant: 'destructive',
        title: lang === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        description: validationError,
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          phone: form.phone.trim() || undefined,
          country: form.country,
          companyName: form.companyName.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: lang === 'en' ? 'Registration failed' : 'فشل التسجيل',
          description: data.error ?? (lang === 'en' ? 'Something went wrong.' : 'حدث خطأ ما.'),
        })
        return
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn('credentials', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast({
          title: lang === 'en' ? 'Account created!' : 'تم إنشاء الحساب!',
          description:
            lang === 'en'
              ? 'Account created. Please sign in.'
              : 'تم إنشاء الحساب. يرجى تسجيل الدخول.',
        })
        router.push('/login')
      } else {
        toast({
          title: lang === 'en' ? 'Welcome to GulfOilDesk!' : 'مرحباً بك في GulfOilDesk!',
          description:
            lang === 'en'
              ? 'Your account has been created successfully.'
              : 'تم إنشاء حسابك بنجاح.',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast({
        variant: 'destructive',
        title: lang === 'en' ? 'Network error' : 'خطأ في الشبكة',
        description:
          lang === 'en'
            ? 'Could not connect to the server. Please try again.'
            : 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {lang === 'en' ? 'Create Your Account' : 'إنشاء حسابك'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {lang === 'en'
            ? 'Join GulfOilDesk — the Gulf\'s #1 oil trading platform'
            : 'انضم إلى GulfOilDesk — منصة التداول النفطي الأولى في الخليج'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row: Full Name + Arabic Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="name" label={lang === 'en' ? 'Full Name' : 'الاسم الكامل'}>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder={lang === 'en' ? 'John Smith' : 'جون سميث'}
              value={form.name}
              onChange={fieldChange('name')}
              disabled={loading}
              required
              className="input-gold"
            />
          </Field>
          <Field id="nameAr" label={lang === 'en' ? 'Name in Arabic' : 'الاسم بالعربية'}>
            <Input
              id="nameAr"
              type="text"
              placeholder="محمد العبدالله"
              value={form.nameAr}
              onChange={fieldChange('nameAr')}
              disabled={loading}
              dir="rtl"
              className="input-gold"
            />
          </Field>
        </div>

        {/* Email */}
        <Field id="email" label={t('email')}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={fieldChange('email')}
            disabled={loading}
            required
            className="input-gold"
          />
        </Field>

        {/* Row: Password + Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="password" label={lang === 'en' ? 'Password' : 'كلمة المرور'}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={lang === 'en' ? 'Min. 8 characters' : '8 أحرف على الأقل'}
              value={form.password}
              onChange={fieldChange('password')}
              disabled={loading}
              required
              className="input-gold"
            />
          </Field>
          <Field id="confirmPassword" label={lang === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={lang === 'en' ? 'Repeat password' : 'أعد كلمة المرور'}
              value={form.confirmPassword}
              onChange={fieldChange('confirmPassword')}
              disabled={loading}
              required
              className={cn(
                'input-gold',
                form.confirmPassword &&
                  form.password !== form.confirmPassword &&
                  'border-destructive/60 focus-visible:ring-destructive/50',
              )}
            />
          </Field>
        </div>

        {/* Row: Role + Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="role" label={t('role')}>
            <Select
              value={form.role}
              onValueChange={(v) => update('role', v as Role)}
              disabled={loading}
            >
              <SelectTrigger id="role" className="input-gold">
                <SelectValue placeholder={lang === 'en' ? 'Select role…' : 'اختر الدور…'} />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {lang === 'en' ? r.en : r.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="country" label={t('country')}>
            <Select
              value={form.country}
              onValueChange={(v) => update('country', v)}
              disabled={loading}
            >
              <SelectTrigger id="country" className="input-gold">
                <SelectValue placeholder={lang === 'en' ? 'Select country…' : 'اختر الدولة…'} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="me-2">{c.flag}</span>
                    {lang === 'en' ? c.en : c.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Row: Phone + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="phone" label={`${t('phone')} (${lang === 'en' ? 'Optional' : 'اختياري'})`}>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+971 50 000 0000"
              value={form.phone}
              onChange={fieldChange('phone')}
              disabled={loading}
              className="input-gold"
            />
          </Field>
          <Field id="companyName" label={`${t('company')} (${lang === 'en' ? 'Optional' : 'اختياري'})`}>
            <Input
              id="companyName"
              type="text"
              autoComplete="organization"
              placeholder={lang === 'en' ? 'ACME Trading LLC' : 'شركة الخليج للتجارة'}
              value={form.companyName}
              onChange={fieldChange('companyName')}
              disabled={loading}
              className="input-gold"
            />
          </Field>
        </div>

        {/* Terms notice */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {lang === 'en'
            ? 'By creating an account you agree to our '
            : 'بإنشاء حساب، فإنك توافق على '}
          <Link href="/terms" className="text-primary hover:underline">
            {lang === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
          </Link>
          {lang === 'en' ? ' and ' : ' و '}
          <Link href="/privacy" className="text-primary hover:underline">
            {lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
          </Link>
          .
        </p>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-amber-500 font-bold shadow-lg shadow-primary/20"
        >
          {loading
            ? lang === 'en'
              ? 'Creating account…'
              : 'جاري إنشاء الحساب…'
            : lang === 'en'
              ? 'Create Account'
              : 'إنشاء حساب'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">
            {lang === 'en' ? 'already have an account?' : 'لديك حساب بالفعل؟'}
          </span>
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('login')}
        </Link>
      </p>
    </div>
  )
}
