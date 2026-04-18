'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, Send, FileText, CheckCircle2, ChevronDown,
  Upload, Paperclip, User, Bot,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn, formatRelativeTime, formatBarrels, formatCurrency, DEAL_STATUS_MAP, PRODUCT_TYPES } from '@/lib/utils'
import type { DealWithRelations } from '@/types'

const STATUS_FLOW = [
  'INQUIRY', 'LOI_SENT', 'FCO_ISSUED', 'NEGOTIATION',
  'SGS_PENDING', 'DLC_PENDING', 'CONTRACTED', 'CLOSED',
]

export default function DealRoomPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [deal, setDeal] = useState<DealWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    const res = await fetch(`/api/deals/${id}`)
    const d = await res.json()
    setDeal(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [deal?.messages?.length])

  async function sendMessage() {
    if (!message.trim() || sending) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId: id, content: message, type: 'TEXT' }),
    })
    if (res.ok) {
      setMessage('')
      await load()
    }
    setSending(false)
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    setShowStatusMenu(false)
    await fetch(`/api/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await load()
    setUpdating(false)
  }

  if (loading || !deal) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  const statusInfo = DEAL_STATUS_MAP[deal.status]
  const currentStepIdx = STATUS_FLOW.indexOf(deal.status)
  const isClosed = deal.status === 'CLOSED' || deal.status === 'FAILED'

  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/deals" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft size={15} className={lang === 'ar' ? 'rotate-180' : ''} />
        {lang === 'ar' ? 'العودة للصفقات' : 'Back to Deals'}
      </Link>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chat area */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
            {/* Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground truncate">{deal.listing?.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', statusInfo?.color)}>
                      {lang === 'ar' ? statusInfo?.ar : statusInfo?.en}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{deal.messages?.length} {lang === 'ar' ? 'رسائل' : 'messages'}</span>
                  </div>
                </div>
                {!isClosed && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-border px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      {lang === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                      <ChevronDown size={12} />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute end-0 top-full mt-1 w-48 bg-[hsl(var(--card))] border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                        {STATUS_FLOW.filter(s => s !== deal.status && STATUS_FLOW.indexOf(s) > currentStepIdx).map(s => (
                          <button key={s} onClick={() => updateStatus(s)}
                            className={cn('w-full text-start px-3 py-2 text-xs hover:bg-white/5 transition-colors', DEAL_STATUS_MAP[s]?.color)}>
                            {lang === 'ar' ? DEAL_STATUS_MAP[s]?.ar : DEAL_STATUS_MAP[s]?.en}
                          </button>
                        ))}
                        <button onClick={() => updateStatus('FAILED')}
                          className="w-full text-start px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 border-t border-border transition-colors">
                          {lang === 'ar' ? 'إلغاء الصفقة' : 'Mark as Failed'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {deal.messages?.map(msg => {
                const isMe = msg.senderId === session?.user?.id
                const isSystem = msg.type === 'STATUS_UPDATE' || msg.type === 'SYSTEM'
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                      <div className="h-px flex-1 bg-border" />
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-border">{msg.content}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )
                }
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                      isMe ? 'bg-gold-500/20 text-gold-400' : 'bg-white/10 text-foreground'
                    )}>
                      {isMe ? (session?.user?.name?.[0]?.toUpperCase() ?? 'M') : <User size={13} />}
                    </div>
                    <div className={cn('max-w-[75%]')}>
                      <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm',
                        isMe ? 'bg-gold-500/15 text-foreground rounded-tr-sm' : 'bg-white/8 text-foreground rounded-tl-sm'
                      )}>
                        {msg.content}
                      </div>
                      <p className={cn('text-[10px] text-muted-foreground mt-0.5 px-1', isMe ? 'text-end' : '')}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!isClosed ? (
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-foreground focus:outline-none focus:border-gold-500/50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    className="w-9 h-9 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Send size={14} className="text-black" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t border-border text-center text-xs text-muted-foreground">
                {deal.status === 'CLOSED'
                  ? (lang === 'ar' ? '✓ تم إغلاق هذه الصفقة بنجاح' : '✓ This deal has been closed successfully')
                  : (lang === 'ar' ? 'تم إلغاء هذه الصفقة' : 'This deal has been marked as failed')}
              </div>
            )}
          </Card>
        </div>

        {/* Deal info sidebar */}
        <div className="space-y-4">
          {/* Status progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">{lang === 'ar' ? 'مراحل الصفقة' : 'Deal Progress'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {STATUS_FLOW.map((s, i) => {
                const done = i < currentStepIdx
                const current = i === currentStepIdx
                const info = DEAL_STATUS_MAP[s]
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn('w-4 h-4 rounded-full flex items-center justify-center border shrink-0',
                      done ? 'bg-gold-500 border-gold-500' : current ? 'border-gold-500' : 'border-border'
                    )}>
                      {done ? <CheckCircle2 size={10} className="text-black" /> :
                        current ? <div className="w-1.5 h-1.5 rounded-full bg-gold-500" /> : null}
                    </div>
                    <span className={cn('text-[11px]',
                      current ? 'text-gold-400 font-semibold' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
                    )}>
                      {lang === 'ar' ? info?.ar : info?.en}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Deal terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">{lang === 'ar' ? 'شروط الصفقة' : 'Deal Terms'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {deal.agreedQuantity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('quantity')}</span>
                  <span className="font-semibold">{formatBarrels(deal.agreedQuantity)}</span>
                </div>
              )}
              {deal.agreedPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('price')}</span>
                  <span className="font-semibold text-gold-400">${deal.agreedPrice}/BBL</span>
                </div>
              )}
              {deal.agreedIncoterms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('incoterms')}</span>
                  <span className="font-semibold">{deal.agreedIncoterms}</span>
                </div>
              )}
              {deal.commissionPct && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'العمولة' : 'Commission'}</span>
                  <span className="font-semibold">{deal.commissionPct}%</span>
                </div>
              )}
              {!deal.agreedQuantity && !deal.agreedPrice && (
                <p className="text-muted-foreground text-center py-2">
                  {lang === 'ar' ? 'لم يتم الاتفاق على الشروط بعد' : 'Terms not agreed yet'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">{lang === 'ar' ? 'أطراف الصفقة' : 'Deal Parties'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: lang === 'ar' ? 'المشتري' : 'Buyer', user: deal.buyer },
                { label: lang === 'ar' ? 'البائع' : 'Seller', user: deal.seller },
                { label: lang === 'ar' ? 'الوسيط' : 'Broker', user: deal.broker },
              ].filter(p => p.user).map(({ label, user }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    {user!.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium">{user!.name}</p>
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                  </div>
                  {user!.isVerified && <CheckCircle2 size={11} className="text-gold-400 ms-auto" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5"><FileText size={12} className="text-gold-400" />{t('documents')}</span>
                <span className="text-muted-foreground font-normal">{deal.documents?.length ?? 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.documents?.length ? (
                <div className="space-y-1.5">
                  {deal.documents.map((doc: any) => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-white/5 transition-colors">
                      <FileText size={11} className="text-gold-400" />
                      <span className="truncate">{doc.name}</span>
                      {doc.isVerified && <CheckCircle2 size={10} className="text-gold-400 ms-auto shrink-0" />}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-2">
                  {lang === 'ar' ? 'لا توجد مستندات بعد' : 'No documents yet'}
                </p>
              )}
              <button className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] text-gold-400 hover:text-gold-300 border border-dashed border-gold-500/30 rounded-lg py-2 transition-colors">
                <Upload size={11} /> {lang === 'ar' ? 'رفع مستند' : 'Upload Document'}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
