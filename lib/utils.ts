import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, decimals = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(n)
}

export function formatBarrels(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M BBL`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K BBL`
  return `${n.toLocaleString()} BBL`
}

export function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export function formatRelativeTime(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

export const PRODUCT_TYPES: Record<string, { en: string; ar: string; color: string }> = {
  CRUDE_OIL:  { en: 'Crude Oil',   ar: 'نفط خام',    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  FUEL_OIL:   { en: 'Fuel Oil',    ar: 'زيت الوقود', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  GASOIL:     { en: 'Gas Oil',     ar: 'زيت الغاز',  color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  JET_A1:     { en: 'Jet A-1',     ar: 'وقود الطائرات', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  LPG:        { en: 'LPG',         ar: 'غاز البترول', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  BITUMEN:    { en: 'Bitumen',     ar: 'البيتومين',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  NAPHTHA:    { en: 'Naphtha',     ar: 'النافثا',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

export const ORIGINS: Record<string, { en: string; ar: string; flag: string }> = {
  'Saudi Arabia': { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية', flag: '🇸🇦' },
  'UAE':          { en: 'UAE',          ar: 'الإمارات',                 flag: '🇦🇪' },
  'Kuwait':       { en: 'Kuwait',       ar: 'الكويت',                  flag: '🇰🇼' },
  'Iraq':         { en: 'Iraq',         ar: 'العراق',                  flag: '🇮🇶' },
  'Oman':         { en: 'Oman',         ar: 'عُمان',                   flag: '🇴🇲' },
  'Qatar':        { en: 'Qatar',        ar: 'قطر',                     flag: '🇶🇦' },
  'Bahrain':      { en: 'Bahrain',      ar: 'البحرين',                 flag: '🇧🇭' },
  'Russia':       { en: 'Russia',       ar: 'روسيا',                   flag: '🇷🇺' },
}

export const DEAL_STATUS_MAP: Record<string, { en: string; ar: string; color: string }> = {
  INQUIRY:         { en: 'Inquiry',          ar: 'استفسار',        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  LOI_SENT:        { en: 'LOI Sent',         ar: 'تم إرسال خطاب النية', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  FCO_ISSUED:      { en: 'FCO Issued',       ar: 'تم إصدار العرض', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  NEGOTIATION:     { en: 'Negotiating',      ar: 'قيد التفاوض',    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  SGS_PENDING:     { en: 'SGS Inspection',   ar: 'انتظار SGS',     color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  DLC_PENDING:     { en: 'DLC Pending',      ar: 'انتظار الاعتماد', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  CONTRACTED:      { en: 'Contracted',       ar: 'تم التعاقد',     color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  CLOSED:          { en: 'Closed ✓',         ar: 'مغلق ✓',         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  FAILED:          { en: 'Failed',           ar: 'فشل',            color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

export function getSulfurLabel(pct: number) {
  if (pct < 0.5) return { label: 'Sweet', labelAr: 'حلو', color: 'text-green-400' }
  if (pct < 1.0) return { label: 'Medium Sour', labelAr: 'متوسط', color: 'text-yellow-400' }
  return { label: 'Sour', labelAr: 'حامض', color: 'text-red-400' }
}

export function getApiLabel(api: number) {
  if (api >= 34) return { label: 'Light', labelAr: 'خفيف', color: 'text-blue-400' }
  if (api >= 31) return { label: 'Medium', labelAr: 'متوسط', color: 'text-yellow-400' }
  return { label: 'Heavy', labelAr: 'ثقيل', color: 'text-orange-400' }
}
