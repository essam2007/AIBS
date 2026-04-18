'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Users, ListOrdered, Handshake, CheckCircle2,
  XCircle, Clock, Shield, TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLangStore } from '@/lib/store'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang } = useLangStore()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'users' | 'listings'>('overview')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/listings').then(r => r.json()),
    ]).then(([s, u, l]) => {
      setStats(s)
      setUsers(u.users ?? [])
      setListings(l.listings ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session])

  async function verifyUser(userId: string, verified: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: verified, kycStatus: verified ? 'APPROVED' : 'REJECTED' }),
    })
    setUsers(u => u.map(u => u.id === userId ? { ...u, isVerified: verified, kycStatus: verified ? 'APPROVED' : 'REJECTED' } : u))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: lang === 'ar' ? 'المستخدمون' : 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: lang === 'ar' ? 'القوائم' : 'Active Listings', value: stats?.activeListings ?? 0, icon: ListOrdered, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: lang === 'ar' ? 'الصفقات' : 'Total Deals', value: stats?.totalDeals ?? 0, icon: Handshake, color: 'text-gold-400', bg: 'bg-gold-500/10' },
    { label: lang === 'ar' ? 'بانتظار التحقق' : 'Pending KYC', value: stats?.pendingKyc ?? 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  const tabs = [
    { id: 'overview', en: 'Overview', ar: 'نظرة عامة' },
    { id: 'users', en: 'Users', ar: 'المستخدمون' },
    { id: 'listings', en: 'Listings', ar: 'القوائم' },
  ] as const

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-gold-400" />
        <h1 className="text-xl font-bold">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
                </div>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                  <Icon size={18} className={color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {tabs.map(({ id, en, ar }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === id ? 'border-gold-500 text-gold-400' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            {lang === 'ar' ? ar : en}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent signups */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{lang === 'ar' ? 'أحدث التسجيلات' : 'Recent Signups'}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-2.5 p-2 rounded hover:bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">{u.role} · {formatRelativeTime(u.createdAt)}</p>
                  </div>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded border',
                    u.kycStatus === 'APPROVED' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                    : u.kycStatus === 'PENDING' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                    : 'text-red-400 border-red-500/20 bg-red-500/10'
                  )}>
                    {u.kycStatus}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* KYC queue */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Clock size={13} className="text-orange-400" />{lang === 'ar' ? 'قائمة التحقق KYC' : 'KYC Queue'}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {users.filter(u => u.kycStatus === 'PENDING').slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-2.5 p-2 rounded bg-white/3 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email} · {u.country}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => verifyUser(u.id, true)}
                      className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center transition-colors">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </button>
                    <button onClick={() => verifyUser(u.id, false)}
                      className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors">
                      <XCircle size={12} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
              {users.filter(u => u.kycStatus === 'PENDING').length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {lang === 'ar' ? '✓ لا توجد طلبات معلقة' : '✓ No pending KYC requests'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Name', 'Email', 'Role', 'Country', 'KYC', 'Verified', 'Joined'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{u.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded border border-border text-muted-foreground">{u.role}</span></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.country}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('px-1.5 py-0.5 rounded border text-[10px]',
                          u.kycStatus === 'APPROVED' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                          : u.kycStatus === 'PENDING' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                          : 'text-red-400 border-red-500/20 bg-red-500/10'
                        )}>{u.kycStatus}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {u.isVerified
                          ? <CheckCircle2 size={13} className="text-gold-400" />
                          : <div className="flex gap-1">
                              <button onClick={() => verifyUser(u.id, true)} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 size={13} /></button>
                              <button onClick={() => verifyUser(u.id, false)} className="text-red-400 hover:text-red-300"><XCircle size={13} /></button>
                            </div>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'listings' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Title', 'Type', 'Side', 'Origin', 'Quantity', 'Status', 'Posted'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l: any) => (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{l.title}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.type}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('px-1.5 py-0.5 rounded border text-[10px]',
                          l.side === 'SELL' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-blue-400 border-blue-500/20 bg-blue-500/10'
                        )}>{l.side}</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.origin}</td>
                      <td className="px-4 py-2.5">{l.quantity?.toLocaleString()} BBL</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('px-1.5 py-0.5 rounded border text-[10px]',
                          l.status === 'ACTIVE' ? 'text-emerald-400 border-emerald-500/20' : 'text-muted-foreground border-border'
                        )}>{l.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
