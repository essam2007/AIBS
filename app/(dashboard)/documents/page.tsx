'use client'

import { useEffect, useState, useRef } from 'react'
import { FileText, Upload, CheckCircle2, Download, Search, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLangStore } from '@/lib/store'
import { translate } from '@/lib/translations'
import { cn, formatDate } from '@/lib/utils'

const DOC_TYPES: Record<string, { en: string; ar: string; color: string }> = {
  SGS_REPORT:      { en: 'SGS Report',        ar: 'تقرير SGS',        color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  LOI:             { en: 'Letter of Intent',   ar: 'خطاب النية',       color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  FCO:             { en: 'Full Corp. Offer',   ar: 'العرض الكامل',     color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  SPA:             { en: 'Sales Agreement',    ar: 'عقد البيع',        color: 'text-gold-400 bg-gold-500/10 border-gold-500/20' },
  BILL_OF_LADING:  { en: 'Bill of Lading',     ar: 'سند الشحن',        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  COO:             { en: 'Certificate Origin', ar: 'شهادة المنشأ',     color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  EXPORT_LICENSE:  { en: 'Export License',     ar: 'رخصة التصدير',     color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  ASSAY:           { en: 'Product Assay',      ar: 'تحليل المنتج',     color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  BCL:             { en: 'Bank Comfort Letter', ar: 'خطاب البنك',      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  OTHER:           { en: 'Other',              ar: 'أخرى',             color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
}

export default function DocumentsPage() {
  const { lang } = useLangStore()
  const t = (k: string) => translate(k, lang)
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(d => { setDocs(d.documents ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || d.type === typeFilter
    return matchSearch && matchType
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'OTHER')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const d = await res.json()
      setDocs(prev => [d, ...prev])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('documents')}</h1>
          <p className="text-muted-foreground text-sm">
            {docs.length} {lang === 'ar' ? 'مستند' : 'documents'}
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Upload size={14} />
            {uploading ? (lang === 'ar' ? 'جاري الرفع...' : 'Uploading...') : t('upload')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث...' : 'Search documents...'} className="ps-8 h-9 text-sm" />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground"
        >
          <option value="">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
          {Object.entries(DOC_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>
          ))}
        </select>
      </div>

      {/* Document vault info */}
      <Card className="border-gold-500/20 bg-gold-500/5">
        <CardContent className="p-3 flex items-start gap-3">
          <ShieldCheck size={16} className="text-gold-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {lang === 'ar'
              ? 'جميع المستندات مخزنة بشكل آمن مع سجل تدقيق كامل. المستندات الموثقة تحمل علامة ✓ خضراء بعد مراجعة فريقنا.'
              : 'All documents are stored securely with a full audit trail. Verified documents carry a ✓ green badge after review by our team.'}
          </p>
        </CardContent>
      </Card>

      {/* Document grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">{lang === 'ar' ? 'لا توجد مستندات بعد' : 'No documents yet'}</p>
          <button onClick={() => fileRef.current?.click()} className="text-gold-400 text-sm hover:underline mt-2">
            {lang === 'ar' ? 'رفع أول مستند' : 'Upload your first document'}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(doc => {
            const docType = DOC_TYPES[doc.type] ?? DOC_TYPES.OTHER
            return (
              <Card key={doc.id} className="hover:border-gold-500/20 transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-border flex items-center justify-center shrink-0 group-hover:border-gold-500/20 transition-colors">
                      <FileText size={18} className="text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        {doc.isVerified && <CheckCircle2 size={13} className="text-gold-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', docType.color)}>
                          {lang === 'ar' ? docType.ar : docType.en}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-gold-400 transition-colors shrink-0">
                      <Download size={15} />
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
