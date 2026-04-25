'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send, Sparkles, TrendingUp, FileText, BarChart2, Users, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { icon: TrendingUp,  label: 'Brent outlook',       prompt: 'What is the current outlook for Brent crude prices and key drivers to watch?' },
  { icon: BarChart2,   label: 'OSP explained',        prompt: 'Explain what an Official Selling Price (OSP) is and how Saudi Aramco sets it.' },
  { icon: FileText,    label: 'Draft LOI',             prompt: 'Help me draft a Letter of Intent for purchasing 500,000 barrels of Arab Light crude FOB Ras Tanura.' },
  { icon: Users,       label: 'Broker checklist',     prompt: 'What should I check before working with a new oil broker in the Gulf? Give me a due diligence checklist.' },
  { icon: TrendingUp,  label: 'API gravity',           prompt: 'Explain API gravity and why it matters for crude oil pricing and refining.' },
  { icon: BarChart2,   label: 'Crack spread',          prompt: 'What is a crack spread and how do refiners use it to assess margins?' },
]

const RESPONSES: Record<string, string> = {
  brent: `**Brent Crude Outlook**

Current price: ~$84/bbl. Key bullish/bearish drivers:

**Bullish factors:**
- OPEC+ maintaining 3.66M bpd of voluntary cuts through Q3
- China demand recovery — April imports at 11.4M bpd (+6.2% YoY)
- US commercial crude inventories near 5-year lows at Cushing
- Fed pause reduces dollar strength pressure on oil

**Bearish factors:**
- OPEC+ compliance slipping (91% in April vs 94% March)
- Libya Es Sider terminal re-opening adds ~250K bpd supply
- Macro uncertainty — global PMI manufacturing still below 50

**Technical levels:**
- Support: $82.50 (50-day MA), $80.00 (psychological)
- Resistance: $86.00 (April high), $90.00 (analyst targets)

**Desk view:** Bias is modestly bullish into summer driving season. Watch OPEC+ June meeting (date TBC) and weekly EIA inventory data.`,

  osp: `**Official Selling Price (OSP) — Explained**

An OSP is the official price a national oil company sets for its crude exports, announced monthly. Think of it as the "list price" adjusted by a formula.

**Formula:**
\`OSP = Benchmark Price ± Differential\`

**For Saudi Aramco (Arab Light to Asia):**
- Benchmark: Average of Oman & Dubai assessments (Platts)
- Differential: Set monthly by Aramco, e.g. "+$0.10/bbl" or "-$0.10/bbl"
- Final price = (Oman/Dubai avg) + differential

**Why it matters:**
- Sets the floor for Gulf crude pricing across the entire term market
- Influences spot cargo negotiations (spot often trades at a premium/discount to OSP)
- A cut in OSP = Aramco wants to defend market share; a raise = confident demand

**Gulf OSP issuers:**
- Saudi Aramco (Arab Light/Medium/Heavy/Extra Light)
- ADNOC (Murban, Das Blend, ADCO grades)
- KPC (Kuwait Export Crude)
- SOMO/Iraq (Basra Light/Medium)
- QatarEnergy (Qatar Marine/Land)
- OQ/Oman (Oman Blend)`,

  loi: `**Draft Letter of Intent — Arab Light Crude**

---

**LETTER OF INTENT**
Date: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}

**BUYER:** [Buyer Company Name], [Registration], [Address]
**SELLER:** [Seller Company Name], [Registration], [Address]

**SUBJECT:** Purchase of Arabian Light Crude Oil

This Letter of Intent is issued in good faith and is subject to successful due diligence and final contract execution.

**Product:** Arabian Light Crude Oil (Arab Light)
**Quantity:** 500,000 barrels (±5% at Buyer's option)
**Quality:** Per Saudi Aramco specifications (API ~34°, Sulfur ~1.8%)
**Origin:** Kingdom of Saudi Arabia
**Loading Port:** Ras Tanura Marine Terminal, Saudi Arabia
**Incoterm:** FOB Ras Tanura
**Pricing:** Oman/Dubai average + Saudi Aramco OSP differential for loading month
**Payment:** Irrevocable Documentary Letter of Credit (DLC), MT700, confirmed
**Inspection:** SGS or Intertek at load port, certificates final and binding
**Laycan:** [Specify 5-day window, e.g. 1–5 June 2026]
**Validity:** This LOI is valid for 72 hours from date of issue.

Buyer confirms financial capability and requests Seller to issue Full Corporate Offer (FCO).

Signed: _________________________ Date: _____________

⚠️ *This is a template for guidance only. Always have final documents reviewed by qualified legal counsel.*`,

  broker: `**Gulf Oil Broker Due Diligence Checklist**

Before committing to any transaction with a new broker:

**Legal & Compliance**
- [ ] Company trade license (valid, includes oil/energy activity codes)
- [ ] DMCC/JAFZA/ADGM registration certificate (if UAE-based)
- [ ] Sanctions screening — run name + company against OFAC, UN, EU, GCC lists
- [ ] KYC/AML documentation per your internal policy
- [ ] PEP (Politically Exposed Person) check on beneficial owners

**Track Record**
- [ ] Minimum 3 verifiable closed transactions (request SGS/Intertek reports)
- [ ] References from at least 2 counterparties in the Gulf
- [ ] Check broker rating on GulfOilDesk — score, reliability, deal count
- [ ] LinkedIn/company website consistency check

**Financial**
- [ ] Bank comfort letter or proof of banking relationship
- [ ] For large transactions (>1M bbl): request proof of funds or BCL
- [ ] Understand their margin structure — is it a % or flat fee per barrel?

**Transaction-Specific**
- [ ] Confirm they have a genuine mandate (Soft Probe/LOI with originator)
- [ ] No excessive broker chain (max 2 intermediaries)
- [ ] Verify Seller has actual access to product before LOI exchange

**Red flags** 🚩
- Requests for "performance bond" or upfront fees before deal
- Cannot produce any prior deal documentation
- Pressure to skip SGS inspection
- Price significantly below market (if too good to be true...)`,

  api: `**API Gravity — The Key Crude Quality Metric**

API Gravity measures how heavy or light crude oil is relative to water. Developed by the American Petroleum Institute.

**Formula:**
\`API = (141.5 / Specific Gravity) - 131.5\`

**Classification:**
| API Range | Grade | Examples |
|-----------|-------|---------|
| ≥ 34°     | Light | Arab Extra Light (39°), Brent (38°), WTI (39.6°) |
| 31–34°    | Medium | Arab Light (33°), Murban (40°) |
| 22–31°    | Heavy | Arab Heavy (27°), Kuwait Export (31°) |
| < 22°     | Extra Heavy | Canadian Oil Sands, Venezuela Merey |

**Why it matters:**
- **Higher API = More valuable** — lighter crude yields more gasoline and distillates per barrel
- Light crude (API 35–45) commands a premium because refiners get more high-value products
- Heavy crude (API <30) trades at a discount and requires complex (hydrocracking) refineries

**Gulf context:**
- Murban (40° API): ADNOC's premium light grade, feeds Asian naphtha crackers
- Arab Light (33° API): World's largest traded crude by volume, Aramco's flagship
- Arab Heavy (27° API): Discounted, mainly to complex refiners in India/Korea`,

  crack: `**Crack Spread — Refinery Margin Indicator**

The crack spread measures the profit margin a refiner earns by "cracking" crude into products.

**Simple 3-2-1 Crack Spread:**
\`Margin = (2 × Gasoline + 1 × Heating Oil) - (3 × WTI)\` ÷ 3

Meaning: process 3 barrels of crude → yield 2 barrels of gasoline + 1 barrel of heating oil.

**Current approximate levels (Gulf context):**
- Brent Crack (Gasoil): ~$22/bbl
- Naphtha Crack vs Brent: ~-$4/bbl (weak — naphtha is a loss-leader product)
- Jet/Kero Crack: ~$18/bbl (strong — aviation demand)
- HFO Crack: ~-$15/bbl (negative — heavy fuel oil is a "bottom of the barrel" product)

**What drives crack spreads:**
- **Product demand** (summer = high gasoline; winter = high heating oil/gasoil)
- **Crude quality** — lighter crude gives higher product yields
- **Refinery runs** — high utilization narrows spreads (more supply of products)
- **Strategic reserves releases** — can temporarily weaken product prices

**Refiner strategy:**
When crack spreads are high → refiners run at max capacity
When spreads are negative → refiners reduce throughput or switch crude slate`,
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('brent') || lower.includes('outlook') || lower.includes('price')) return RESPONSES.brent
  if (lower.includes('osp') || lower.includes('official selling')) return RESPONSES.osp
  if (lower.includes('loi') || lower.includes('letter of intent') || lower.includes('draft')) return RESPONSES.loi
  if (lower.includes('broker') || lower.includes('due diligence') || lower.includes('checklist')) return RESPONSES.broker
  if (lower.includes('api') || lower.includes('gravity')) return RESPONSES.api
  if (lower.includes('crack') || lower.includes('spread') || lower.includes('refin')) return RESPONSES.crack

  return `I'm the GulfOilDesk AI assistant. I can help you with:

• **Market analysis** — Brent/WTI/Dubai crude outlooks, OSP explanations, OPEC+ impact
• **Deal support** — Draft LOIs, FCOs, checklists, Incoterm explanations
• **Due diligence** — Broker screening, KYC requirements, sanctions awareness
• **Industry education** — API gravity, sulfur content, crack spreads, freight (Worldscale, TD3C)
• **Gulf specifics** — DMCC, ADNOC, Aramco OSP, Fujairah bunkering, GCC trade flows

Try asking me: *"What is a crack spread?"* or *"Draft an LOI for 500K bbl Arab Light"* or *"Explain TD3C freight routes"*.`
}

function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return <p key={i} className="font-bold text-foreground mt-3 mb-1 first:mt-0">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-muted-foreground">{formatInline(line.slice(2))}</li>
      }
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const done = line.startsWith('- [x]')
        return <li key={i} className="ml-4 list-none flex items-start gap-2 text-muted-foreground">
          <span className={cn('mt-0.5 text-xs', done ? 'text-emerald-400' : 'text-zinc-500')}>{done ? '✓' : '☐'}</span>
          <span>{formatInline(line.slice(6))}</span>
        </li>
      }
      if (line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-none text-muted-foreground">{formatInline(line.slice(2))}</li>
      }
      if (line.startsWith('⚠️')) {
        return <p key={i} className="text-amber-400/80 text-xs mt-2 italic">{line}</p>
      }
      if (line.startsWith('🚩')) {
        return <p key={i} className="font-semibold text-red-400 mt-2">{line}</p>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-muted-foreground">{formatInline(line)}</p>
    })
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

export default function AskTheDesk() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to **Ask the Desk** — your AI oil markets assistant.

I can help with market analysis, deal documentation, due diligence, and Gulf oil industry knowledge. Ask me anything.`,
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, minimized])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setMinimized(false)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    const response = getResponse(msg)
    setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    setLoading(false)
  }, [input])

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => { setOpen(true); setMinimized(false) }}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl transition-all',
          'bg-[#F5A623] hover:bg-[#e09610] text-black font-bold text-sm',
          open && !minimized && 'opacity-0 pointer-events-none',
        )}
      >
        <Sparkles size={16} />
        Ask the Desk
        <span className="hidden sm:inline text-[10px] font-normal opacity-70 ms-1">⌘K</span>
      </button>

      {/* Drawer */}
      {open && (
        <div className={cn(
          'fixed bottom-5 right-5 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-[#13131b] border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-all overflow-hidden',
          minimized ? 'h-12' : 'h-[560px] max-h-[calc(100vh-100px)]',
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 shrink-0">
            <Sparkles size={15} className="text-[#F5A623]" />
            <span className="text-sm font-bold text-foreground flex-1">Ask the Desk</span>
            <button onClick={() => setMinimized(m => !m)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronDown size={16} className={cn('transition-transform', minimized && 'rotate-180')} />
            </button>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X size={16} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center shrink-0 me-2 mt-0.5">
                        <Sparkles size={12} className="text-[#F5A623]" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/20'
                        : 'bg-white/5 border border-white/5',
                    )}>
                      {msg.role === 'assistant'
                        ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                        : msg.content
                      }
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center shrink-0 me-2">
                      <Sparkles size={12} className="text-[#F5A623]" />
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin text-[#F5A623]" />
                      <span className="text-xs text-muted-foreground">Analyzing…</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map(qp => {
                    const Icon = qp.icon
                    return (
                      <button
                        key={qp.label}
                        onClick={() => send(qp.prompt)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 text-left transition-all"
                      >
                        <Icon size={11} className="text-[#F5A623] shrink-0" />
                        {qp.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 shrink-0">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#F5A623]/40">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Ask about oil markets, deals, grades…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="text-[#F5A623] disabled:opacity-30 hover:text-[#e09610] transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-700 mt-1.5 text-center">
                  AI responses are for informational purposes only, not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
