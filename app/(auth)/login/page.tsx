'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { toast } from '@/lib/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const lang = useLangStore((s) => s.lang)
  const t = (key: string) => translate(key, lang)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast({
        variant: 'destructive',
        title: lang === 'en' ? 'Missing fields' : 'حقول مفقودة',
        description:
          lang === 'en'
            ? 'Please enter your email and password.'
            : 'يرجى إدخال بريدك الإلكتروني وكلمة المرور.',
      })
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: lang === 'en' ? 'Sign in failed' : 'فشل تسجيل الدخول',
          description:
            lang === 'en'
              ? 'Invalid email or password. Please try again.'
              : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        })
      } else {
        toast({
          title: lang === 'en' ? 'Welcome back!' : 'مرحباً بعودتك!',
          description:
            lang === 'en' ? 'Redirecting to your dashboard…' : 'جاري التحويل إلى لوحة التحكم…',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast({
        variant: 'destructive',
        title: lang === 'en' ? 'Something went wrong' : 'حدث خطأ ما',
        description:
          lang === 'en'
            ? 'Please try again in a moment.'
            : 'يرجى المحاولة مرة أخرى بعد لحظة.',
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
          {lang === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {lang === 'en'
            ? 'Sign in to your GulfOilDesk account'
            : 'سجّل الدخول إلى حسابك في GulfOilDesk'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={lang === 'en' ? 'you@company.com' : 'you@company.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="input-gold"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              {lang === 'en' ? 'Password' : 'كلمة المرور'}
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              {lang === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={lang === 'en' ? 'Enter your password' : 'أدخل كلمة المرور'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="input-gold"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-amber-500 font-bold shadow-lg shadow-primary/20 mt-2"
        >
          {loading
            ? lang === 'en'
              ? 'Signing in…'
              : 'جاري تسجيل الدخول…'
            : t('login')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">
            {lang === 'en' ? 'or' : 'أو'}
          </span>
        </div>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        {lang === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟'}{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          {t('register')}
        </Link>
      </p>
    </div>
  )
}
