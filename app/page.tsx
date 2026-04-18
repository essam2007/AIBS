'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { PRODUCT_TYPES as PRODUCT_TYPE_MAP } from '@/lib/utils'

// ── Language Toggle ───────────────────────────────────────────────────────────
function LanguageToggle() {
  const { lang, toggleLang } = useLangStore()
  return (
    <button
      onClick={toggleLang}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
        'border border-border text-muted-foreground hover:text-foreground hover:border-primary/50',
        'transition-colors duration-150',
      )}
      aria-label="Toggle language"
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇦🇪' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'العربية' : 'English'}</span>
    </button>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const lang = useLangStore((s) => s.lang)
  const t = (key: string) => translate(key, lang)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl text-primary leading-none">⬡</span>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-foreground text-sm tracking-tight">GulfOilDesk</span>
            <span className="text-[10px] text-primary/80 font-medium tracking-wide">خليج النفط</span>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/listings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('listings')}
          </Link>
          <Link
            href="/brokers"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('brokers')}
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === 'en' ? 'About' : 'عن المنصة'}
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex border-primary/50 text-primary hover:bg-primary/10 hover:border-primary">
              {t('login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-amber-500 font-semibold shadow-sm shadow-primary/20">
              {lang === 'en' ? 'Get Started' : 'ابدأ الآن'}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  const lang = useLangStore((s) => s.lang)
  const t = (key: string) => translate(key, lang)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        {/* Base dark */}
        <div className="absolute inset-0 bg-[hsl(222_47%_4%)]" />
        {/* Gold glow top-left */}
        <div
          className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full opacity-[0.07]"
          style={{
            background:
              'radial-gradient(circle, hsl(43 96% 56%) 0%, transparent 70%)',
            animation: 'pulse-glow 8s ease-in-out infinite',
          }}
        />
        {/* Amber glow bottom-right */}
        <div
          className="absolute -bottom-48 -right-24 h-[700px] w-[700px] rounded-full opacity-[0.05]"
          style={{
            background:
              'radial-gradient(circle, hsl(38 90% 50%) 0%, transparent 70%)',
            animation: 'pulse-glow 10s ease-in-out infinite 2s',
          }}
        />
        {/* Subtle center glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full opacity-[0.03]"
          style={{
            background:
              'radial-gradient(circle, hsl(43 80% 60%) 0%, transparent 65%)',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(43 96% 56% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(43 96% 56% / 0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: var(--tw-opacity, 0.07); }
          33%       { transform: scale(1.08) translate(20px, -20px); }
          66%       { transform: scale(0.95) translate(-15px, 15px); }
        }
      `}</style>

      <div className="container mx-auto px-4 md:px-6 text-center max-w-5xl">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs text-primary font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          {lang === 'en' ? 'DMCC Registered Platform · Dubai, UAE' : 'منصة مسجلة في مركز DMCC · دبي، الإمارات'}
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="gradient-gold">
            {t('tagline')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register">
            <Button
              size="xl"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-amber-500 font-bold text-base shadow-lg shadow-primary/25 px-10"
            >
              {t('getStarted')}
            </Button>
          </Link>
          <Link href="/listings">
            <Button
              size="xl"
              variant="ghost"
              className="w-full sm:w-auto text-foreground border border-border hover:border-primary/50 hover:bg-primary/5 font-medium text-base px-10"
            >
              {t('viewListings')}
            </Button>
          </Link>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            {
              value: '22%',
              label: lang === 'en' ? 'Global Oil Production' : 'من الإنتاج النفطي العالمي',
              sub: lang === 'en' ? 'Gulf region share' : 'حصة منطقة الخليج',
            },
            {
              value: '50,000+',
              label: lang === 'en' ? 'Daily Barrels Listed' : 'برميل يومي مدرج',
              sub: lang === 'en' ? 'Across all product types' : 'لجميع أنواع المنتجات',
            },
            {
              value: 'DMCC',
              label: lang === 'en' ? 'Registered Platform' : 'منصة مسجلة',
              sub: lang === 'en' ? 'Dubai Multi Commodities Centre' : 'مركز دبي للسلع المتعددة',
            },
          ].map((stat) => (
            <div
              key={stat.value}
              className="glass-card rounded-xl p-5 text-center hover:glow-gold transition-all duration-300"
            >
              <div className="text-3xl font-bold gradient-gold mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
        <span className="text-xs tracking-widest uppercase">
          {lang === 'en' ? 'Explore' : 'استكشف'}
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
      </div>
    </section>
  )
}

// ── Features Section ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const lang = useLangStore((s) => s.lang)

  const features = [
    {
      icon: '✓',
      titleEn: 'Verified Brokers',
      titleAr: 'وسطاء موثقون',
      descEn: 'Every counterparty is KYC-verified before accessing the platform. Zero tolerance for fraud.',
      descAr: 'كل طرف مقابل تم التحقق منه عبر KYC قبل الوصول إلى المنصة. لا تسامح مع الاحتيال.',
    },
    {
      icon: '📋',
      titleEn: 'Full Spec Listings',
      titleAr: 'قوائم كاملة المواصفات',
      descEn: 'API gravity, sulfur %, origin country, incoterms and delivery schedule — all standardised.',
      descAr: 'الكثافة API ونسبة الكبريت وبلد المنشأ وشروط الإنكوترمز وجدول التسليم — كلها موحدة.',
    },
    {
      icon: '🤝',
      titleEn: 'Secure Deal Room',
      titleAr: 'غرفة صفقات آمنة',
      descEn: 'Replace WhatsApp threads with a structured, tracked deal workflow from inquiry to close.',
      descAr: 'استبدل مجموعات واتساب بسير عمل منظم وقابل للتتبع من الاستفسار حتى الإغلاق.',
    },
    {
      icon: '📄',
      titleEn: 'Document Vault',
      titleAr: 'خزينة المستندات',
      descEn: 'SGS inspection reports, LOI, SPA, Q88 — all documents organised and accessible in one place.',
      descAr: 'تقارير SGS وخطاب النية وعقد البيع والشراء — جميع المستندات منظمة في مكان واحد.',
    },
    {
      icon: '⭐',
      titleEn: 'Broker Ratings',
      titleAr: 'تقييمات الوسطاء',
      descEn: 'Reputation scores built from real closed deals — not self-reported profiles.',
      descAr: 'درجات السمعة مبنية على صفقات مغلقة فعلية، وليس ملفات شخصية ذاتية.',
    },
    {
      icon: '🤖',
      titleEn: 'AI Deal Matching',
      titleAr: 'مطابقة صفقات بالذكاء الاصطناعي',
      descEn: 'Instantly match buyers with compatible sellers based on product specs, quantity and incoterms.',
      descAr: 'طابق المشترين مع البائعين المتوافقين فوراً بناءً على المواصفات والكميات وشروط الإنكوترمز.',
    },
  ]

  return (
    <section className="py-24 bg-[hsl(222_40%_5%)]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-4">
            {lang === 'en' ? 'Platform Features' : 'ميزات المنصة'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {lang === 'en'
              ? 'Everything You Need to Trade Oil in the Gulf'
              : 'كل ما تحتاجه للتداول النفطي في الخليج'}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            {lang === 'en'
              ? 'Built specifically for GCC oil markets — not a generic commodity platform.'
              : 'مبنية خصيصاً لأسواق النفط الخليجية، وليست منصة سلع عامة.'}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className={cn(
                'glass-card rounded-xl p-6 group',
                'hover:glow-gold hover:border-primary/30 transition-all duration-300',
              )}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl border border-primary/20 group-hover:bg-primary/15 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {lang === 'en' ? feature.titleEn : feature.titleAr}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === 'en' ? feature.descEn : feature.descAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works Section ──────────────────────────────────────────────────────
function HowItWorksSection() {
  const lang = useLangStore((s) => s.lang)

  const steps = [
    {
      numberEn: '01',
      titleEn: 'Register & Verify',
      titleAr: 'سجّل وتحقق',
      descEn: 'Create your account and complete KYC verification for your company to unlock full platform access.',
      descAr: 'أنشئ حسابك وأكمل التحقق من هوية شركتك للحصول على وصول كامل للمنصة.',
    },
    {
      numberEn: '02',
      titleEn: 'Post or Browse Listings',
      titleAr: 'انشر أو تصفح القوائم',
      descEn: 'Post a buy or sell listing with full product specifications — API, sulfur, origin, quantity, incoterms.',
      descAr: 'انشر قائمة شراء أو بيع بمواصفات المنتج الكاملة — API والكبريت والمنشأ والكمية والإنكوترمز.',
    },
    {
      numberEn: '03',
      titleEn: 'Initiate a Deal',
      titleAr: 'ابدأ صفقة',
      descEn: 'Open a secure Deal Room when you find a match. Exchange LOI, FCO and SPA in a tracked workspace.',
      descAr: 'افتح غرفة صفقات آمنة عند العثور على تطابق. تبادل LOI وFCO وSPA في مساحة عمل قابلة للتتبع.',
    },
    {
      numberEn: '04',
      titleEn: 'Close with Confidence',
      titleAr: 'أغلق بثقة',
      descEn: 'Finalise the deal with a complete document trail and leave verified ratings for your counterparty.',
      descAr: 'أنهِ الصفقة مع سجل مستندات كامل واترك تقييمات موثقة للطرف الآخر.',
    },
  ]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-4">
            {lang === 'en' ? 'How It Works' : 'كيف تعمل المنصة'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {lang === 'en' ? 'From Listing to Closed Deal in 4 Steps' : 'من القائمة إلى الصفقة المغلقة في 4 خطوات'}
          </h2>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className={cn(
                  'relative z-10 flex h-16 w-16 items-center justify-center rounded-full mb-5',
                  'border-2 border-primary bg-primary/10 text-primary font-bold text-lg',
                  'group-hover:bg-primary group-hover:text-primary-foreground',
                  'transition-all duration-300 shadow-lg shadow-primary/10',
                )}>
                  {step.numberEn}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {lang === 'en' ? step.titleEn : step.titleAr}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                  {lang === 'en' ? step.descEn : step.descAr}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-amber-500 font-bold shadow-lg shadow-primary/20 px-10">
              {lang === 'en' ? 'Start Trading Now' : 'ابدأ التداول الآن'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Product Types Section ─────────────────────────────────────────────────────
function ProductTypesSection() {
  const lang = useLangStore((s) => s.lang)
  const router = useRouter()

  const productIcons: Record<string, string> = {
    CRUDE_OIL: '🛢',
    FUEL_OIL: '⛽',
    GASOIL: '🔵',
    JET_A1: '✈',
    LPG: '💨',
    BITUMEN: '🏗',
    NAPHTHA: '⚗',
  }

  return (
    <section className="py-24 bg-[hsl(222_40%_5%)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-4">
            {lang === 'en' ? 'Product Coverage' : 'تغطية المنتجات'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {lang === 'en' ? 'Every Gulf Oil Product, In One Place' : 'جميع منتجات النفط الخليجية في مكان واحد'}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {lang === 'en'
              ? 'Browse live listings across all major crude and refined product categories.'
              : 'تصفح القوائم الحية لجميع فئات النفط الخام والمنتجات المكررة الرئيسية.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(PRODUCT_TYPE_MAP).map(([key, value]) => (
            <button
              key={key}
              onClick={() => router.push(`/listings?type=${key}`)}
              className={cn(
                'flex items-center gap-2.5 px-5 py-3 rounded-full border text-sm font-medium',
                'transition-all duration-200 hover:scale-105 hover:shadow-lg',
                value.color,
                'hover:brightness-125',
              )}
            >
              <span className="text-lg leading-none">{productIcons[key]}</span>
              <span>{lang === 'en' ? value.en : value.ar}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/listings">
            <Button variant="outline" size="lg" className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary">
              {lang === 'en' ? 'View All Listings' : 'عرض جميع القوائم'}
              <span className="ms-2 rtl-flip">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  const lang = useLangStore((s) => s.lang)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn(
          'relative overflow-hidden rounded-2xl p-10 text-center',
          'border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-900/5',
        )}>
          {/* Background glow */}
          <div className="absolute inset-0 -z-10 opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, hsl(43 96% 56% / 0.2) 0%, transparent 70%)' }}
          />
          <h2 className="text-3xl sm:text-4xl font-bold gradient-gold mb-4">
            {lang === 'en' ? 'Ready to Trade Smarter?' : 'مستعد للتداول بذكاء؟'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base">
            {lang === 'en'
              ? 'Join hundreds of verified brokers, buyers and sellers already trading on GulfOilDesk.'
              : 'انضم إلى مئات الوسطاء والمشترين والبائعين الموثقين الذين يتداولون بالفعل على GulfOilDesk.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-primary text-primary-foreground hover:bg-amber-500 font-bold shadow-xl shadow-primary/20 px-12">
                {lang === 'en' ? 'Get Started Free' : 'ابدأ مجاناً'}
              </Button>
            </Link>
            <Link href="/brokers">
              <Button size="xl" variant="ghost" className="border border-border hover:border-primary/40 hover:bg-primary/5 px-10">
                {lang === 'en' ? 'Browse Brokers' : 'تصفح الوسطاء'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const lang = useLangStore((s) => s.lang)
  const t = (key: string) => translate(key, lang)

  return (
    <footer className="border-t border-border bg-[hsl(222_47%_3%)] py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl text-primary leading-none">⬡</span>
              <div>
                <div className="font-bold text-foreground text-base">GulfOilDesk</div>
                <div className="text-xs text-primary/70">خليج النفط</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {lang === 'en'
                ? 'The Gulf\'s most trusted oil trading platform. Verified brokers, live specs, AI deal matching.'
                : 'منصة التداول النفطي الأكثر موثوقية في الخليج. وسطاء موثقون ومواصفات حية ومطابقة صفقات ذكية.'}
            </p>
            <p className="mt-4 text-xs text-muted-foreground/70 flex items-center gap-1.5">
              <span>🏢</span>
              {lang === 'en'
                ? 'Registered with DMCC, Dubai, UAE'
                : 'مسجلة في مركز DMCC، دبي، الإمارات العربية المتحدة'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {lang === 'en' ? 'Platform' : 'المنصة'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/listings', label: t('listings') },
                { href: '/brokers', label: t('brokers') },
                { href: '/deals', label: t('deals') },
                { href: '/about', label: lang === 'en' ? 'About' : 'عن المنصة' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {lang === 'en' ? 'Legal' : 'القانونية'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/privacy', label: lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية' },
                { href: '/terms', label: lang === 'en' ? 'Terms of Service' : 'شروط الخدمة' },
                { href: '/compliance', label: lang === 'en' ? 'Compliance' : 'الامتثال' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
          <p>© 2026 GulfOilDesk. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</p>
          <p>
            {lang === 'en'
              ? 'Registered with DMCC · Dubai, UAE 🇦🇪'
              : 'مسجلة في DMCC · دبي، الإمارات 🇦🇪'}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductTypesSection />
      <CTABanner />
      <Footer />
    </main>
  )
}
