'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2, Globe, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const TradingViewChart = dynamic(() => import('@/components/shared/TradingViewChart'), { ssr: false })

interface Instrument {
  id: string
  label: string
  labelAr: string
  symbol: string
  description: string
  unit: string
}

const INSTRUMENTS: Instrument[] = [
  { id: 'brent',      label: 'Brent Crude',    labelAr: 'خام برنت',        symbol: 'TVC:UKOIL',       description: 'ICE Brent Crude Oil Front Month',           unit: '$/bbl' },
  { id: 'wti',        label: 'WTI Crude',      labelAr: 'خام WTI',         symbol: 'TVC:USOIL',       description: 'NYMEX WTI Light Sweet Crude Front Month',   unit: '$/bbl' },
  { id: 'natgas',     label: 'Natural Gas',    labelAr: 'الغاز الطبيعي',   symbol: 'TVC:NATURALGAS',  description: 'NYMEX Henry Hub Natural Gas',               unit: '$/MMBtu' },
  { id: 'gasoil',     label: 'Gas Oil',        labelAr: 'زيت الغاز',       symbol: 'ICEEUR:G1!',      description: 'ICE Gas Oil (Diesel) Front Month',          unit: '$/mt' },
  { id: 'hfo',        label: 'Fuel Oil 380',   labelAr: 'زيت وقود 380',    symbol: 'NYMEX:OH1!',      description: 'NYMEX NY Harbor Heating Oil (HFO proxy)',   unit: '$/mt' },
  { id: 'crack',      label: '3-2-1 Crack',    labelAr: 'هامش التكرير',    symbol: 'NYMEX:CL1!',      description: 'WTI Crude as crack spread reference',       unit: '$/bbl' },
]

const SPECS: Record<string, Array<{ label: string; value: string; info: string }>> = {
  brent: [
    { label: 'API Gravity', value: '38.06°', info: 'Brent is a light crude. API >34 = Light, 31–34 = Medium, <31 = Heavy' },
    { label: 'Sulfur', value: '0.37%', info: 'Brent is sweet crude. <0.5% sulfur = Sweet, >0.5% = Sour' },
    { label: 'Origin', value: 'North Sea 🇬🇧🇳🇴', info: 'Blend of crudes from 15+ North Sea fields' },
    { label: 'Delivery', value: 'FOB Sullom Voe', info: 'Free On Board at Sullom Voe terminal, Shetland' },
    { label: 'Lot Size', value: '1,000 bbl', info: 'Each ICE Brent futures contract = 1,000 barrels' },
    { label: 'Tick', value: '$0.01/bbl', info: 'Minimum price movement = $0.01 per barrel = $10/contract' },
  ],
  wti: [
    { label: 'API Gravity', value: '39.6°', info: 'WTI is light crude. Lighter than Brent, commands premium for refining' },
    { label: 'Sulfur', value: '0.24%', info: 'Very sweet crude. Preferred by US Gulf refiners' },
    { label: 'Origin', value: 'Midland Basin 🇺🇸', info: 'Permian Basin, West Texas. Key price benchmark for Americas' },
    { label: 'Delivery', value: 'CIF Cushing, OK', info: 'Delivery hub at Cushing, Oklahoma — "Pipeline Crossroads of the World"' },
    { label: 'Lot Size', value: '1,000 bbl', info: 'Each NYMEX WTI futures contract = 1,000 barrels' },
    { label: 'Spread vs Brent', value: 'Brent - WTI', info: 'Brent typically trades at a premium to WTI due to export logistics' },
  ],
  natgas: [
    { label: 'Henry Hub', value: 'Louisiana 🇺🇸', info: 'Henry Hub in Erath, Louisiana — US natural gas pricing hub' },
    { label: 'Unit', value: 'MMBtu', info: 'Million British Thermal Units — standard energy content measure' },
    { label: 'Lot Size', value: '10,000 MMBtu', info: 'Each NYMEX Natural Gas contract = 10,000 MMBtu' },
    { label: 'Seasonality', value: 'Winter peak', info: 'Prices typically spike Oct–Feb on heating demand' },
    { label: 'LNG Link', value: 'Spot indexed', info: 'Gulf LNG cargoes indexed to JCC, HH, or TTF' },
    { label: 'Arab Gulf', value: 'Qatar/UAE', info: 'Qatar (QatarEnergy) and UAE (ADNOC LNG) are top Gulf LNG exporters' },
  ],
  gasoil: [
    { label: 'Grade', value: '0.1% S max', info: '10ppm sulfur max — ultra-low sulfur diesel (ULSD) specification' },
    { label: 'Hub', value: 'ARA / AG', info: 'Amsterdam–Rotterdam–Antwerp and Arab Gulf are key pricing hubs' },
    { label: 'Lot Size', value: '100 mt', info: 'Each ICE Gas Oil contract = 100 metric tonnes' },
    { label: 'Crack Spread', value: 'Gasoil vs Brent', info: 'Refinery margin: Gasoil price minus crude cost. Indicates refiner profitability' },
    { label: 'ULSD', value: 'Diesel equivalent', info: 'Gas Oil = European name for diesel/heating oil blend' },
    { label: 'Incoterm', value: 'FOB / CIF / CFR', info: 'FOB = seller loads, buyer pays freight. CIF = seller pays freight + insurance' },
  ],
  hfo: [
    { label: 'Viscosity', value: '380 cSt', info: 'Centistokes at 50°C. Higher viscosity = thicker, requires heating to pump' },
    { label: 'Sulfur', value: '3.5% (old spec)', info: 'Post-IMO 2020: bunker fuel max 0.5% S globally, 3.5% in ECAs only' },
    { label: 'Hub', value: 'Fujairah 🇦🇪', info: 'Port of Fujairah — world\'s 2nd largest bunkering hub after Singapore' },
    { label: 'VLSFO', value: '0.5% S max', info: 'Very Low Sulfur Fuel Oil — IMO 2020 compliant bunker fuel' },
    { label: 'Spread', value: 'HFO vs VLSFO', info: 'Hi-5 spread: price difference between 3.5% S HFO and 0.5% S VLSFO' },
    { label: 'Scrubber', value: 'Retrofit option', info: 'Ships with exhaust gas scrubbers can burn cheaper HFO legally' },
  ],
  crack: [
    { label: '3-2-1 Formula', value: '(2×Gas + 1×HO - 3×WTI) / 3', info: 'Approximate refinery margin: process 3 bbls crude → 2 bbls gasoline + 1 bbl heating oil' },
    { label: 'Positive crack', value: 'Refinery profitable', info: 'Crack spread > 0 means product prices cover crude cost' },
    { label: 'Brent crack', value: 'Gasoil vs Brent', info: 'European version: Brent crack = Gasoil price − Brent price' },
    { label: 'FCC Unit', value: 'Fluid Cat Cracker', info: 'Key refinery unit converting heavy gas oil to lighter, more valuable products' },
    { label: 'Hydrocracker', value: 'Adds hydrogen', info: 'Converts heavier fractions to premium distillates using high-pressure hydrogen' },
    { label: 'Margin drivers', value: 'Crude + products', info: 'Crack spread moves with demand (products) vs supply (crude) independently' },
  ],
}

interface PriceTick {
  price: string
  change: string
  pct: string
  high: string
  low: string
  vol: string
  positive: boolean
}

const MOCK_PRICES: Record<string, PriceTick> = {
  brent:  { price: '84.12', change: '+0.67', pct: '+0.80%', high: '84.95', low: '83.44', vol: '412.3K', positive: true },
  wti:    { price: '80.45', change: '+0.53', pct: '+0.66%', high: '81.20', low: '79.88', vol: '387.1K', positive: true },
  natgas: { price: '2.847', change: '-0.032', pct: '-1.11%', high: '2.901', low: '2.821', vol: '98.4K', positive: false },
  gasoil: { price: '744.00', change: '+5.25', pct: '+0.71%', high: '748.50', low: '738.75', vol: '67.2K', positive: true },
  hfo:    { price: '425.50', change: '-2.50', pct: '-0.58%', high: '431.00', low: '423.25', vol: '21.8K', positive: false },
  crack:  { price: '22.40', change: '+0.18', pct: '+0.81%', high: '22.75', low: '21.90', vol: '—', positive: true },
}

interface TooltipProps { text: string; children: React.ReactNode }
function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="group relative inline-block cursor-help">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 rounded-lg bg-[#1c1c26] border border-white/10 p-3 text-xs text-zinc-300 shadow-xl leading-relaxed">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1c1c26]" />
      </span>
    </span>
  )
}

export default function MarketsPage() {
  const [activeSymbol, setActiveSymbol] = useState<string>('brent')
  const [interval, setInterval] = useState('D')
  const instrument = INSTRUMENTS.find(i => i.id === activeSymbol)!
  const prices = MOCK_PRICES[activeSymbol]
  const specs = SPECS[activeSymbol] ?? []

  const INTERVALS = ['1', '5', '15', '60', '240', 'D', 'W', 'M']
  const INTERVAL_LABELS: Record<string, string> = {
    '1': '1m', '5': '5m', '15': '15m', '60': '1H', '240': '4H', 'D': '1D', 'W': '1W', 'M': '1M',
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6 overflow-hidden bg-[#0a0a0f]">

      {/* ── Symbol tabs (top bar like Binance Futures) ─────────────── */}
      <div className="flex items-center gap-0 border-b border-white/5 bg-[#13131b] px-2 overflow-x-auto shrink-0">
        {INSTRUMENTS.map(inst => {
          const p = MOCK_PRICES[inst.id]
          const active = activeSymbol === inst.id
          return (
            <button
              key={inst.id}
              onClick={() => setActiveSymbol(inst.id)}
              className={cn(
                'flex flex-col items-start px-4 py-2.5 border-b-2 text-left shrink-0 transition-all',
                active
                  ? 'border-[#F5A623] bg-white/3'
                  : 'border-transparent hover:bg-white/5 hover:border-white/20',
              )}
            >
              <span className={cn('text-xs font-bold', active ? 'text-[#F5A623]' : 'text-zinc-300')}>
                {inst.label}
              </span>
              <span className={cn('text-[11px] font-mono font-semibold', p.positive ? 'text-emerald-400' : 'text-red-400')}>
                {p.price} <span className="text-[10px]">{p.pct}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Price info bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-white/5 bg-[#0f0f17] shrink-0 overflow-x-auto">
        <div className="flex items-baseline gap-2 shrink-0">
          <Tooltip text={`${instrument.description}. Price in ${instrument.unit}.`}>
            <span className={cn('text-2xl font-bold font-mono tabular-nums', prices.positive ? 'text-emerald-400' : 'text-red-400')}>
              {prices.price}
            </span>
          </Tooltip>
          <span className={cn('text-sm font-mono', prices.positive ? 'text-emerald-400' : 'text-red-400')}>
            {prices.change} ({prices.pct})
          </span>
          {prices.positive
            ? <TrendingUp size={16} className="text-emerald-400" />
            : <TrendingDown size={16} className="text-red-400" />
          }
        </div>
        <div className="flex items-center gap-5 text-[11px] text-zinc-500 font-mono shrink-0">
          <Tooltip text="Highest price traded in the current 24-hour session">
            <span>H <span className="text-zinc-300">{prices.high}</span></span>
          </Tooltip>
          <Tooltip text="Lowest price traded in the current 24-hour session">
            <span>L <span className="text-zinc-300">{prices.low}</span></span>
          </Tooltip>
          <Tooltip text="Number of contracts traded in the current 24-hour period">
            <span>Vol <span className="text-zinc-300">{prices.vol}</span></span>
          </Tooltip>
          <Tooltip text={instrument.description}>
            <span className="flex items-center gap-1 text-[#F5A623]/70">
              <Globe size={11} /> {instrument.unit}
            </span>
          </Tooltip>
        </div>

        {/* Interval selector */}
        <div className="ms-auto flex items-center gap-1 shrink-0">
          {INTERVALS.map(i => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-mono font-medium transition-all',
                interval === i
                  ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
              )}
            >
              {INTERVAL_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart + Specs ──────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Chart area */}
        <div className="flex-1 min-w-0">
          <TradingViewChart
            key={`${activeSymbol}-${interval}`}
            symbol={instrument.symbol}
            interval={interval}
            height="100%"
            containerId={`tv_${activeSymbol}`}
          />
        </div>

        {/* Right panel — contract specs */}
        <div className="w-56 border-l border-white/5 bg-[#0f0f17] flex flex-col overflow-y-auto shrink-0 hidden xl:flex">
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contract Info</p>
            <p className="text-xs font-semibold text-zinc-200 mt-0.5">{instrument.label}</p>
          </div>
          <div className="divide-y divide-white/5">
            {specs.map(spec => (
              <div key={spec.label} className="px-3 py-2">
                <Tooltip text={spec.info}>
                  <div>
                    <p className="text-[10px] text-zinc-500">{spec.label}</p>
                    <p className="text-xs font-mono font-semibold text-zinc-200 mt-0.5 underline decoration-dotted decoration-zinc-600">
                      {spec.value}
                    </p>
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>

          {/* Live OSP section */}
          <div className="mt-auto border-t border-white/5 px-3 py-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Gulf OSP Differentials</p>
            {[
              { grade: 'Arab Light', diff: '-$0.10', info: 'Saudi Aramco OSP: price vs Oman/Dubai average. Negative = discount to benchmark.' },
              { grade: 'Murban', diff: '+$1.45', info: 'ADNOC Murban OSP vs ICE Murban Futures. Positive = premium to benchmark.' },
              { grade: 'Basra Light', diff: '-$0.80', info: 'SOMO Basra Light OSP vs Oman/Dubai average for Asian buyers.' },
              { grade: 'Kuwait Export', diff: '-$0.35', info: 'KPC Kuwait Export OSP vs Oman/Dubai average.' },
            ].map(osp => (
              <div key={osp.grade} className="flex justify-between items-center py-1">
                <Tooltip text={osp.info}>
                  <span className="text-[11px] text-zinc-400 underline decoration-dotted decoration-zinc-600 cursor-help">
                    {osp.grade}
                  </span>
                </Tooltip>
                <span className={cn(
                  'text-[11px] font-mono font-semibold',
                  osp.diff.startsWith('+') ? 'text-emerald-400' : 'text-red-400',
                )}>
                  {osp.diff}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom ticker strip ─────────────────────────────────────── */}
      <div className="border-t border-white/5 bg-[#13131b] px-4 py-1.5 flex items-center gap-6 overflow-x-auto shrink-0">
        {[
          { label: 'Brent–WTI', value: '+3.67', info: 'Brent premium over WTI. Reflects export logistics and quality differences.' },
          { label: 'Brent–Dubai', value: '+1.82', info: 'EFS (Exchange of Futures for Swaps): Brent premium over Dubai benchmark. Key for East/West arbitrage.' },
          { label: 'Hi-5 Spread', value: '$83.50', info: 'HFO 380cSt vs VLSFO 0.5%S spread at Fujairah. Shows bunker fuel switchover economics.' },
          { label: 'TD3C', value: 'WS 65.5', info: 'Worldscale rate for VLCC tanker route: Ras Tanura (Saudi) to Chiba (Japan). Proxy for Gulf→Asia freight.' },
          { label: 'Fujairah Stocks', value: '22.1M bbl', info: 'Total oil product inventories at Fujairah, UAE. Key indicator for East-of-Suez supply balance.' },
          { label: 'DXY', value: '104.32', info: 'US Dollar Index. Stronger USD typically pressures oil prices as it makes crude more expensive for other currencies.' },
          { label: 'USD/SAR', value: '3.7500', info: 'Saudi Riyal is pegged to USD at 3.75 since 1986. Effectively fixed — use as a proxy for Gulf FX stability.' },
        ].map(item => (
          <Tooltip key={item.label} text={item.info}>
            <div className="flex items-center gap-1.5 shrink-0 cursor-help">
              <span className="text-[10px] text-zinc-500">{item.label}</span>
              <span className="text-[10px] font-mono font-semibold text-zinc-300">{item.value}</span>
            </div>
          </Tooltip>
        ))}
        <div className="ms-auto flex items-center gap-1.5 shrink-0">
          <Activity size={12} className="text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-500">Live</span>
        </div>
      </div>
    </div>
  )
}
