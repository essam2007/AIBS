'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, ListOrdered, Handshake, Users,
  FileText, User, Settings, LogOut, Bell, Menu, X,
  ChevronRight, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, key: 'dashboard' },
  { href: '/listings',    icon: ListOrdered,      key: 'listings' },
  { href: '/deals',       icon: Handshake,        key: 'deals' },
  { href: '/brokers',     icon: Users,            key: 'brokers' },
  { href: '/documents',   icon: FileText,         key: 'documents' },
  { href: '/profile',     icon: User,             key: 'profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLangStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-oil-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gold-400 text-sm">{translate('loading', lang)}</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const t = (key: string) => translate(key, lang)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 bottom-0 z-30 w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col transition-transform duration-300',
        lang === 'ar' ? 'right-0' : 'left-0',
        sidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'),
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[hsl(var(--border))]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">G</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gold-400">GulfOilDesk</div>
              <div className="text-[10px] text-muted-foreground">خليج النفط</div>
            </div>
          </Link>
          <button className="lg:hidden ms-auto text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <Icon size={18} className={active ? 'text-gold-400' : 'text-muted-foreground group-hover:text-foreground'} />
                <span className="flex-1">{t(key)}</span>
                {active && <ChevronRight size={14} className={cn('text-gold-500/60', lang === 'ar' && 'rotate-180')} />}
              </Link>
            )
          })}
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                pathname.startsWith('/admin')
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <Shield size={18} />
              <span>{t('admin')}</span>
            </Link>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{session.user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.user.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-muted-foreground hover:text-red-400 transition-colors"
              title={t('logout')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-w-0', 'lg:ms-64')}>
        {/* Top bar */}
        <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <LanguageToggle />
          <Link href="/listings/new">
            <button className="hidden sm:flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
              + {t('newListing')}
            </button>
          </Link>
          <button className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={19} />
            <span className="absolute -top-1 -end-1 w-4 h-4 bg-gold-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">3</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
