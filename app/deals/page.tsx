'use client'

import { useState } from 'react'

interface OilDeal {
  id: string
  type: 'buy' | 'sell'
  grade: string
  volume: number    // barrels
  priceType: 'fixed' | 'dated-brent' | 'wti-diff'
  price: number
  currency: 'USD'
  origin: string
  deliveryPort: string
  loadingDate: string
  expiresAt: string
  contact: string
  company: string
  postedAt: string
  status: 'active' | 'pending' | 'closed'
  notes?: string
}

const MOCK_DEALS: OilDeal[] = [
  {
    id: 'deal-1', type: 'sell', grade: 'Arab Light (34° API)', volume: 500_000,
    priceType: 'dated-brent', price: -0.20, currency: 'USD',
    origin: 'Saudi Arabia', deliveryPort: 'Ras Tanura',
    loadingDate: '2026-05-10', expiresAt: '2026-05-01',
    contact: 'trading@example-co.com', company: 'Gulf Trading Co.',
    postedAt: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'active',
    notes: 'CIF Rotterdam available. Full parcel or split 250k.',
  },
  {
    id: 'deal-2', type: 'buy', grade: 'Brent Blend (38° API)', volume: 250_000,
    priceType: 'dated-brent', price: 0.10, currency: 'USD',
    origin: 'North Sea', deliveryPort: 'Rotterdam',
    loadingDate: '2026-05-15', expiresAt: '2026-05-05',
    contact: 'ops@northsea-refinery.com', company: 'NorthSea Refinery Ltd.',
    postedAt: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'active',
    notes: 'Prompt loading window 14-16 May. DES Rotterdam.',
  },
  {
    id: 'deal-3', type: 'sell', grade: 'WTI Crude (40° API)', volume: 1_000_000,
    priceType: 'wti-diff', price: -0.15, currency: 'USD',
    origin: 'USA (Permian)', deliveryPort: 'Houston (LOOP)',
    loadingDate: '2026-05-20', expiresAt: '2026-05-08',
    contact: 'desk@permian-energy.com', company: 'Permian Energy Corp.',
    postedAt: new Date(Date.now() - 3600000 * 8).toISOString(), status: 'active',
    notes: '1M bbl pipeline-quality WTI. Pipeline + vessel options.',
  },
  {
    id: 'deal-4', type: 'buy', grade: 'Bonny Light (37° API)', volume: 600_000,
    priceType: 'dated-brent', price: 0.35, currency: 'USD',
    origin: 'Nigeria', deliveryPort: 'Bonny Terminal',
    loadingDate: '2026-06-01', expiresAt: '2026-05-20',
    contact: 'crude@lagos-trading.ng', company: 'Lagos Commodity Traders',
    postedAt: new Date(Date.now() - 3600000 * 12).toISOString(), status: 'active',
  },
  {
    id: 'deal-5', type: 'sell', grade: 'Dubai Sour (31° API)', volume: 300_000,
    priceType: 'dated-brent', price: -1.80, currency: 'USD',
    origin: 'UAE', deliveryPort: 'Jebel Ali',
    loadingDate: '2026-05-25', expiresAt: '2026-05-12',
    contact: 'oil@gulf-commodities.ae', company: 'Gulf Commodities DMCC',
    postedAt: new Date(Date.now() - 3600000 * 18).toISOString(), status: 'active',
    notes: 'Suitable for Singapore / Japan refineries.',
  },
]

const GRADES = [
  'Arab Light (34° API)', 'Arab Heavy (27° API)', 'Brent Blend (38° API)',
  'WTI Crude (40° API)', 'Bonny Light (37° API)', 'Dubai Sour (31° API)',
  'Basrah Light (33° API)', 'Urals (31° API)', 'ESPO Blend (35° API)',
  'Murban (40.5° API)', 'Other',
]

const PORTS = [
  'Ras Tanura, SA', 'Jebel Ali, UAE', 'Fujairah, UAE', 'Rotterdam, NL',
  'Houston (LOOP), USA', 'Corpus Christi, USA', 'Singapore', 'Yokohama, JP',
  'Bonny Terminal, NG', 'Sidi Kerir, EG', 'Skikda, DZ', 'Other',
]

function priceDisplay(d: OilDeal): string {
  if (d.priceType === 'fixed') return `$${d.price.toFixed(2)}/bbl`
  const label = d.priceType === 'dated-brent' ? 'Dated Brent' : 'WTI'
  const diff = d.price >= 0 ? `+$${d.price.toFixed(2)}` : `-$${Math.abs(d.price).toFixed(2)}`
  return `${label} ${diff}/bbl`
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DealsPage() {
  const [deals, setDeals]         = useState<OilDeal[]>(MOCK_DEALS)
  const [filter, setFilter]       = useState<'all' | 'buy' | 'sell'>('all')
  const [showForm, setShowForm]   = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [sentId, setSentId]       = useState<string | null>(null)

  // Post deal form state
  const [form, setForm] = useState({
    type: 'sell' as 'buy' | 'sell',
    grade: GRADES[0],
    volume: '',
    priceType: 'dated-brent' as 'fixed' | 'dated-brent' | 'wti-diff',
    price: '',
    origin: '',
    deliveryPort: PORTS[0],
    loadingDate: '',
    expiresAt: '',
    company: '',
    contact: '',
    notes: '',
  })

  const visible = deals.filter(d => filter === 'all' || d.type === filter)

  function handlePost(e: React.FormEvent) {
    e.preventDefault()
    const newDeal: OilDeal = {
      id: `deal-${Date.now()}`,
      type: form.type,
      grade: form.grade,
      volume: parseInt(form.volume) || 0,
      priceType: form.priceType,
      price: parseFloat(form.price) || 0,
      currency: 'USD',
      origin: form.origin,
      deliveryPort: form.deliveryPort,
      loadingDate: form.loadingDate,
      expiresAt: form.expiresAt,
      company: form.company,
      contact: form.contact,
      notes: form.notes,
      postedAt: new Date().toISOString(),
      status: 'active',
    }
    setDeals(prev => [newDeal, ...prev])
    setShowForm(false)
    setForm(f => ({ ...f, volume: '', price: '', origin: '', notes: '' }))
  }

  function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    setSentId(inquiryId)
    setInquiryId(null)
    setInquiryMsg('')
    setTimeout(() => setSentId(null), 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(7,7,14,0) 60%)',
        border: '1px solid rgba(0,212,170,0.1)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🤝</span>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5' }}>Deal Desk</h1>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.08em', background: 'rgba(34,197,94,0.12)', color: '#22c55e', textTransform: 'uppercase' }}>LIVE</span>
          </div>
          <p style={{ fontSize: 12, color: '#55556a', maxWidth: 500 }}>
            Gulf Oil Desk deal board — post crude oil for sale, request volumes, or connect with counterparties.
            All deals are indicative; finalization requires bilateral agreement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: '#00d4aa', border: 'none', color: '#000',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Post Deal
          </button>
        </div>
      </div>

      {/* Post deal form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(0,212,170,0.15)',
          borderRadius: 16, padding: 24,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#eeeef5', marginBottom: 20 }}>Post a New Deal</h2>
          <form onSubmit={handlePost}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>

              <Field label="Deal Type">
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['sell', 'buy'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: form.type === t ? (t === 'sell' ? '#22c55e' : '#3b82f6') : 'rgba(255,255,255,0.06)',
                        color: form.type === t ? '#000' : '#8888a8',
                      }}
                    >{t === 'sell' ? '🛢️ Sell' : '🛒 Buy'}</button>
                  ))}
                </div>
              </Field>

              <Field label="Oil Grade">
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  style={{ width: '100%', height: 36, paddingLeft: 8, borderRadius: 7, fontSize: 12 }}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>

              <Field label="Volume (barrels)">
                <input required type="number" placeholder="e.g. 500000" value={form.volume}
                  onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Pricing Basis">
                <select value={form.priceType} onChange={e => setForm(f => ({ ...f, priceType: e.target.value as typeof form.priceType }))}
                  style={{ width: '100%', height: 36, paddingLeft: 8, borderRadius: 7, fontSize: 12 }}>
                  <option value="dated-brent">Dated Brent ± diff</option>
                  <option value="wti-diff">WTI ± diff</option>
                  <option value="fixed">Fixed $/bbl</option>
                </select>
              </Field>

              <Field label={form.priceType === 'fixed' ? 'Price ($/bbl)' : 'Differential ($/bbl)'}>
                <input required type="number" step="0.01" placeholder={form.priceType === 'fixed' ? '88.50' : '-0.25'}
                  value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Origin / Country">
                <input required type="text" placeholder="e.g. Saudi Arabia" value={form.origin}
                  onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Delivery / Loading Port">
                <select value={form.deliveryPort} onChange={e => setForm(f => ({ ...f, deliveryPort: e.target.value }))}
                  style={{ width: '100%', height: 36, paddingLeft: 8, borderRadius: 7, fontSize: 12 }}>
                  {PORTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="Loading Date">
                <input required type="date" value={form.loadingDate}
                  onChange={e => setForm(f => ({ ...f, loadingDate: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Offer Expiry">
                <input required type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Company Name">
                <input required type="text" placeholder="Your company" value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  style={iStyle} />
              </Field>

              <Field label="Contact Email">
                <input required type="email" placeholder="trading@yourco.com" value={form.contact}
                  onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                  style={iStyle} />
              </Field>
            </div>

            <div style={{ marginTop: 14 }}>
              <Field label="Notes (optional)">
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Delivery terms, vessel availability, quality specs, etc."
                  style={{ ...iStyle, height: 72, resize: 'vertical', paddingTop: 8 }} />
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" style={{ padding: '10px 28px', background: '#00d4aa', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Post Deal
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#8888a8', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sent confirmation */}
      {sentId && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, color: '#22c55e', fontSize: 13 }}>
          ✓ Inquiry sent to counterparty. They will contact you directly.
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {(['all', 'sell', 'buy'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`tab-btn${filter === f ? ' active' : ''}`}
              style={{ fontSize: 12, padding: '4px 14px' }}
            >
              {f === 'all' ? 'All Deals' : f === 'sell' ? '🛢️ Sellers' : '🛒 Buyers'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#55556a' }}>{visible.length} active listings</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#55556a' }}>
          All deals indicative. Gulf Oil Desk is not a counterparty.
        </span>
      </div>

      {/* Deal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(deal => (
          <div key={deal.id} style={{
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${deal.type === 'sell' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)'}`,
            borderRadius: 14, padding: '16px 20px',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start',
          }}>
            <div>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: deal.type === 'sell' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                  color: deal.type === 'sell' ? '#22c55e' : '#3b82f6',
                }}>
                  {deal.type === 'sell' ? '🛢️ SELL' : '🛒 BUY'}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#eeeef5' }}>{deal.grade}</span>
                <span style={{ fontSize: 12, color: '#8888a8' }}>
                  {(deal.volume / 1000).toFixed(0)}K bbls
                </span>
                <span style={{ fontSize: 10, color: '#55556a', marginLeft: 'auto' }}>{timeAgo(deal.postedAt)}</span>
              </div>

              {/* Key info grid */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 10 }}>
                {[
                  { label: 'Price',    value: priceDisplay(deal) },
                  { label: 'Origin',   value: deal.origin },
                  { label: 'Port',     value: deal.deliveryPort },
                  { label: 'Loading',  value: deal.loadingDate },
                  { label: 'Expires',  value: deal.expiresAt },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: 10, color: '#55556a' }}>{row.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#eeeef5' }}>{row.value}</div>
                  </div>
                ))}
              </div>

              {/* Company + notes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#8888a8' }}>
                <span>🏢 {deal.company}</span>
                {deal.notes && (
                  <span style={{ color: '#55556a' }}>· {deal.notes.slice(0, 100)}{deal.notes.length > 100 ? '…' : ''}</span>
                )}
              </div>
            </div>

            {/* Inquire button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 }}>
              <button
                onClick={() => setInquiryId(deal.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: deal.type === 'sell' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                  border: `1px solid ${deal.type === 'sell' ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.25)'}`,
                  color: deal.type === 'sell' ? '#22c55e' : '#3b82f6',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {deal.type === 'sell' ? 'Inquire Buy' : 'Offer Sell'}
              </button>
              <a href={`mailto:${deal.contact}?subject=Inquiry: ${deal.grade} ${(deal.volume/1000).toFixed(0)}K bbls`}
                style={{
                  padding: '7px 14px', borderRadius: 8, textAlign: 'center', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#8888a8', fontSize: 11,
                }}
              >
                Email
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry modal */}
      {inquiryId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 28, width: '100%', maxWidth: 480,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', marginBottom: 6 }}>Send Inquiry</h3>
            <p style={{ fontSize: 12, color: '#55556a', marginBottom: 18 }}>
              Your message will be sent directly to the counterparty. Include your company name, volume needs, and preferred terms.
            </p>
            <form onSubmit={handleInquiry}>
              <textarea
                required autoFocus
                value={inquiryMsg}
                onChange={e => setInquiryMsg(e.target.value)}
                placeholder="Dear counterparty, we are interested in this parcel. Our company is…"
                style={{ ...iStyle, width: '100%', height: 120, resize: 'vertical', marginBottom: 16, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ padding: '9px 24px', background: '#00d4aa', border: 'none', borderRadius: 9, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Send Inquiry
                </button>
                <button type="button" onClick={() => setInquiryId(null)} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: '#8888a8', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: '#55556a', lineHeight: 1.6, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        ⚠️ Gulf Oil Desk acts as an information platform only. All deals listed are indicative and subject to bilateral
        negotiation. Gulf Oil Desk is not a broker, dealer, or counterparty to any transaction. Always conduct your own
        due diligence and consult legal counsel before entering into any commodity transaction.
      </div>
    </div>
  )
}

/* helpers */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: '#55556a', display: 'block', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const iStyle: React.CSSProperties = {
  width: '100%', height: 36, paddingLeft: 10, paddingRight: 10,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 7, color: '#eeeef5', fontSize: 12, boxSizing: 'border-box',
}
