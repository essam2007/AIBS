'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import NewsFeed from '@/components/news/NewsFeed'
import Calendar from '@/components/calendar/Calendar'
import AssistantPanel from '@/components/assistant/AssistantPanel'

/* ─── types ──────────────────────────────────────────────────────────────── */
interface Candle { time: number; open: number; high: number; low: number; close: number; volume?: number }

const TIMEFRAMES = [
  { label: '1D',  interval: '1m',  range: '1d'  },
  { label: '5D',  interval: '5m',  range: '5d'  },
  { label: '1M',  interval: '1d',  range: '1mo' },
  { label: '3M',  interval: '1d',  range: '3mo' },
  { label: '6M',  interval: '1d',  range: '6mo' },
  { label: '1Y',  interval: '1wk', range: '1y'  },
  { label: '2Y',  interval: '1wk', range: '2y'  },
]

const SYMBOLS = [
  { value: 'CL=F',    label: 'WTI Crude'  },
  { value: 'BZ=F',    label: 'Brent'      },
  { value: 'NG=F',    label: 'Nat Gas'    },
  { value: 'HO=F',    label: 'Heat. Oil'  },
  { value: 'RB=F',    label: 'Gasoline'   },
  { value: 'GC=F',    label: 'Gold'       },
  { value: '^GSPC',   label: 'S&P 500'    },
  { value: '^IXIC',   label: 'NASDAQ'     },
  { value: 'BTC-USD', label: 'Bitcoin'    },
  { value: 'XOM',     label: 'Exxon'      },
  { value: 'CVX',     label: 'Chevron'    },
  { value: 'XLE',     label: 'Energy ETF' },
]

const CHART_TYPES = [
  { value: 'candlestick', label: '🕯 Candles' },
  { value: 'line',        label: '📈 Line'    },
  { value: 'area',        label: '🏔 Area'    },
  { value: 'bar',         label: '▮ Bars'     },
]

const TABS = ['Price', 'News', 'Calendar', 'AI Assistant'] as const
type Tab = typeof TABS[number]

/* ─── indicator math ─────────────────────────────────────────────────────── */
function calcSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    return data.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0) / period
  })
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1)
  const result: (number | null)[] = Array(data.length).fill(null)
  let ema = data.slice(0, period).reduce((s, v) => s + v, 0) / period
  result[period - 1] = ema
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
    result[i] = ema
  }
  return result
}

function calcBollinger(data: number[], period = 20, stdDev = 2): { upper: (number | null)[]; lower: (number | null)[]; mid: (number | null)[] } {
  const mid = calcSMA(data, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []
  data.forEach((_, i) => {
    if (i < period - 1) { upper.push(null); lower.push(null); return }
    const slice = data.slice(i - period + 1, i + 1)
    const mean  = mid[i]!
    const std   = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period)
    upper.push(mean + stdDev * std)
    lower.push(mean - stdDev * std)
  })
  return { upper, lower, mid }
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = Array(closes.length).fill(null)
  if (closes.length < period + 1) return result
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) gains += d; else losses -= d
  }
  let avgG = gains / period, avgL = losses / period
  result[period] = 100 - 100 / (1 + avgG / (avgL || 1))
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgG = (avgG * (period - 1) + Math.max(d, 0)) / period
    avgL = (avgL * (period - 1) + Math.max(-d, 0)) / period
    result[i] = 100 - 100 / (1 + avgG / (avgL || 1))
  }
  return result
}

function calcMACD(closes: number[]): { macd: (number | null)[]; signal: (number | null)[]; hist: (number | null)[] } {
  const ema12 = calcEMA(closes, 12)
  const ema26 = calcEMA(closes, 26)
  const macd  = ema12.map((v, i) => v != null && ema26[i] != null ? v - ema26[i]! : null)
  const validMACD = macd.filter(v => v != null) as number[]
  const signalArr = calcEMA(validMACD, 9)
  const signal: (number | null)[] = Array(macd.length).fill(null)
  let si = 0
  macd.forEach((v, i) => { if (v != null) { signal[i] = signalArr[si++] ?? null } })
  const hist = macd.map((v, i) => v != null && signal[i] != null ? v - signal[i]! : null)
  return { macd, signal, hist }
}

/* ─── main component ─────────────────────────────────────────────────────── */
interface Props {
  initialSymbol?: string
  height?: number
  showTabs?: boolean
}

export default function ChartWidget({ initialSymbol = 'CL=F', height = 500, showTabs = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<unknown>(null)
  const seriesRef    = useRef<unknown>(null)
  const volRef       = useRef<unknown>(null)
  const rsiChartRef  = useRef<unknown>(null)
  const macdChartRef = useRef<unknown>(null)

  const [symbol,    setSymbol]    = useState(initialSymbol)
  const [search,    setSearch]    = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [tf,        setTf]        = useState(TIMEFRAMES[4])
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar'>('candlestick')
  const [tab,       setTab]       = useState<Tab>('Price')
  const [linkNews,  setLinkNews]  = useState(true)

  // Overlays
  const [showVol,  setShowVol]  = useState(true)
  const [showSMA,  setShowSMA]  = useState(false)
  const [showEMA,  setShowEMA]  = useState(false)
  const [showBB,   setShowBB]   = useState(false)
  const [showRSI,  setShowRSI]  = useState(false)
  const [showMACD, setShowMACD] = useState(false)

  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange,  setPriceChange]  = useState<{ abs: number; pct: number } | null>(null)
  const [hoverPrice,   setHoverPrice]   = useState<number | null>(null)

  const filteredSymbols = SYMBOLS.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.value.toLowerCase().includes(search.toLowerCase())
  )

  const loadChart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&interval=${tf.interval}&range=${tf.range}`)
      const data = await res.json()
      return (data.candles ?? []) as Candle[]
    } catch { return [] }
    finally { setLoading(false) }
  }, [symbol, tf])

  useEffect(() => {
    if (tab !== 'Price') return
    let mounted = true

    const init = async () => {
      const { createChart, ColorType, CrosshairMode, LineStyle } = await import('lightweight-charts')
      if (!containerRef.current || !mounted) return

      // Destroy existing charts
      for (const ref of [chartRef, rsiChartRef, macdChartRef]) {
        if (ref.current) {
          try { (ref.current as { remove(): void }).remove() } catch {}
          ref.current = null
        }
      }
      seriesRef.current = null; volRef.current = null

      const panelCount = 1 + (showRSI ? 1 : 0) + (showMACD ? 1 : 0)
      const mainH = Math.floor((height - 80) * (panelCount > 1 ? 0.6 : 1))

      // ── Main chart ──────────────────────────────────────────────────────
      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: mainH,
        layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8888a8', fontSize: 11 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)', scaleMargins: { top: 0.1, bottom: showVol ? 0.22 : 0.1 } },
        timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: true, secondsVisible: false },
      })
      chartRef.current = chart

      const c = chart as unknown as {
        addCandlestickSeries: (o: unknown) => unknown
        addLineSeries: (o: unknown) => unknown
        addAreaSeries: (o: unknown) => unknown
        addBarSeries: (o: unknown) => unknown
        addHistogramSeries: (o: unknown) => unknown
        subscribeCrosshairMove: (fn: (p: unknown) => void) => void
        timeScale: () => { fitContent(): void }
        priceScale: (id: string) => { applyOptions(o: unknown): void }
        resize: (w: number, h: number) => void
        remove: () => void
      }

      // Main series
      let mainSeries: unknown
      if (chartType === 'candlestick') {
        mainSeries = c.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderUpColor: '#22c55e', borderDownColor: '#ef4444', wickUpColor: 'rgba(34,197,94,0.6)', wickDownColor: 'rgba(239,68,68,0.6)' })
      } else if (chartType === 'line') {
        mainSeries = c.addLineSeries({ color: '#00d4aa', lineWidth: 2 })
      } else if (chartType === 'area') {
        mainSeries = c.addAreaSeries({ lineColor: '#00d4aa', topColor: 'rgba(0,212,170,0.2)', bottomColor: 'rgba(0,212,170,0.01)', lineWidth: 2 })
      } else {
        mainSeries = c.addBarSeries({ upColor: '#22c55e', downColor: '#ef4444' })
      }
      seriesRef.current = mainSeries

      // Volume
      if (showVol) {
        const volSeries = c.addHistogramSeries({ color: 'rgba(255,255,255,0.1)', priceFormat: { type: 'volume' }, priceScaleId: 'vol' })
        c.priceScale('vol').applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } })
        volRef.current = volSeries
      }

      // Load candles
      const candles = await loadChart()
      if (!mounted || candles.length === 0) return

      const closes = candles.map(c => c.close)
      const setD = (s: unknown, d: unknown[]) => (s as { setData(d: unknown[]): void }).setData(d)

      if (chartType === 'candlestick' || chartType === 'bar') {
        setD(mainSeries, candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })))
      } else {
        setD(mainSeries, candles.map(c => ({ time: c.time, value: c.close })))
      }

      if (showVol && volRef.current) {
        setD(volRef.current, candles.map(c => ({ time: c.time, value: c.volume ?? 0, color: c.close >= c.open ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' })))
      }

      // SMA 20
      if (showSMA) {
        const sma = calcSMA(closes, 20)
        const smaSeries = c.addLineSeries({ color: '#f59e0b', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false })
        setD(smaSeries, candles.filter((_, i) => sma[i] != null).map((c, i, arr) => {
          const idx = candles.indexOf(arr[i])
          return { time: c.time, value: sma[idx]! }
        }).filter((_, i) => sma[candles.findIndex(ca => ca.time === candles[i]?.time)] != null))
        // Simpler approach:
        const smaData = candles.map((c, i) => sma[i] != null ? { time: c.time, value: sma[i]! } : null).filter(Boolean)
        setD(smaSeries, smaData)
      }

      // EMA 20
      if (showEMA) {
        const ema = calcEMA(closes, 20)
        const emaSeries = c.addLineSeries({ color: '#a78bfa', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false })
        setD(emaSeries, candles.map((c, i) => ema[i] != null ? { time: c.time, value: ema[i]! } : null).filter(Boolean))
      }

      // Bollinger Bands
      if (showBB) {
        const bb = calcBollinger(closes)
        const bbOpts = { lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }
        const upper = c.addLineSeries({ ...bbOpts, color: 'rgba(59,130,246,0.7)' })
        const lower = c.addLineSeries({ ...bbOpts, color: 'rgba(59,130,246,0.7)' })
        const mid   = c.addLineSeries({ ...bbOpts, color: 'rgba(59,130,246,0.4)', lineStyle: LineStyle.Dashed })
        setD(upper, candles.map((ca, i) => bb.upper[i] != null ? { time: ca.time, value: bb.upper[i]! } : null).filter(Boolean))
        setD(lower, candles.map((ca, i) => bb.lower[i] != null ? { time: ca.time, value: bb.lower[i]! } : null).filter(Boolean))
        setD(mid,   candles.map((ca, i) => bb.mid[i]   != null ? { time: ca.time, value: bb.mid[i]!   } : null).filter(Boolean))
      }

      // Price stats
      const last = candles[candles.length - 1], first = candles[0]
      if (last && first) {
        setCurrentPrice(last.close)
        const abs = last.close - first.close
        setPriceChange({ abs, pct: (abs / first.close) * 100 })
      }

      c.timeScale().fitContent()

      // Crosshair
      c.subscribeCrosshairMove((param: unknown) => {
        const p = param as { time?: number; seriesData?: Map<unknown, { value?: number; close?: number }> }
        if (!p.time || !p.seriesData) { setHoverPrice(null); return }
        const d = p.seriesData.get(mainSeries)
        setHoverPrice(d?.close ?? d?.value ?? null)
      })

      // Resize observer
      const ro = new ResizeObserver(entries => {
        if (entries[0] && chartRef.current) {
          (chartRef.current as { resize(w: number, h: number): void }).resize(entries[0].contentRect.width, mainH)
        }
      })
      ro.observe(containerRef.current!)

      // ── RSI panel ─────────────────────────────────────────────────────
      if (showRSI) {
        const rsiH = 120
        const rsiDiv = document.createElement('div')
        containerRef.current!.parentElement!.appendChild(rsiDiv)
        const rsiChart = createChart(rsiDiv, {
          width: containerRef.current!.clientWidth, height: rsiH,
          layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8888a8', fontSize: 10 },
          grid: { vertLines: { color: 'rgba(255,255,255,0.02)' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
          rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)', scaleMargins: { top: 0.1, bottom: 0.1 } },
          timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: false },
        })
        rsiChartRef.current = rsiChart
        const rsiSeries = (rsiChart as unknown as typeof c).addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false })
        const rsi = calcRSI(closes)
        setD(rsiSeries, candles.map((ca, i) => rsi[i] != null ? { time: ca.time, value: rsi[i]! } : null).filter(Boolean))
        // Overbought/Oversold lines
        const ob = (rsiChart as unknown as typeof c).addLineSeries({ color: 'rgba(239,68,68,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false })
        const os = (rsiChart as unknown as typeof c).addLineSeries({ color: 'rgba(34,197,94,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false })
        setD(ob, [{ time: candles[0].time, value: 70 }, { time: candles[candles.length-1].time, value: 70 }])
        setD(os, [{ time: candles[0].time, value: 30 }, { time: candles[candles.length-1].time, value: 30 }])
      }

      // ── MACD panel ────────────────────────────────────────────────────
      if (showMACD && candles.length >= 26) {
        const macdH = 100
        const macdDiv = document.createElement('div')
        containerRef.current!.parentElement!.appendChild(macdDiv)
        const macdChart = createChart(macdDiv, {
          width: containerRef.current!.clientWidth, height: macdH,
          layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8888a8', fontSize: 10 },
          grid: { vertLines: { color: 'rgba(255,255,255,0.02)' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
          rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
          timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: false },
        })
        macdChartRef.current = macdChart
        const mc = macdChart as unknown as typeof c
        const { macd, signal, hist } = calcMACD(closes)
        const macdLine   = mc.addLineSeries({ color: '#00d4aa', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        const signalLine = mc.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        const histSeries = mc.addHistogramSeries({ priceLineVisible: false })
        setD(macdLine,   candles.map((ca, i) => macd[i] != null   ? { time: ca.time, value: macd[i]!   } : null).filter(Boolean))
        setD(signalLine, candles.map((ca, i) => signal[i] != null ? { time: ca.time, value: signal[i]! } : null).filter(Boolean))
        setD(histSeries, candles.map((ca, i) => hist[i] != null   ? { time: ca.time, value: hist[i]!, color: hist[i]! >= 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)' } : null).filter(Boolean))
      }
    }

    init()
    return () => {
      mounted = false
      for (const ref of [chartRef, rsiChartRef, macdChartRef]) {
        if (ref.current) { try { (ref.current as { remove(): void }).remove() } catch {} ref.current = null }
      }
    }
  }, [symbol, tf, chartType, showVol, showSMA, showEMA, showBB, showRSI, showMACD, height, loadChart, tab])

  const up = (priceChange?.pct ?? 0) >= 0

  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top toolbar ────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.055)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

        {/* Symbol picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSearch(v => !v)}
            style={{
              height: 32, padding: '0 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#eeeef5', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {SYMBOLS.find(s => s.value === symbol)?.label ?? symbol}
            <span style={{ fontSize: 10 }}>▾</span>
          </button>
          {showSearch && (
            <div style={{
              position: 'absolute', top: 36, left: 0, zIndex: 100, width: 200,
              background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol…"
                style={{
                  width: '100%', height: 36, paddingLeft: 12,
                  background: 'rgba(255,255,255,0.04)', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: '#eeeef5', fontSize: 12, boxSizing: 'border-box',
                }}
              />
              {filteredSymbols.map(s => (
                <button key={s.value} onClick={() => { setSymbol(s.value); setShowSearch(false); setSearch('') }}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'none', border: 'none',
                    textAlign: 'left', color: s.value === symbol ? '#00d4aa' : '#eeeef5',
                    fontSize: 12, cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{s.label}</span>
                  <span style={{ color: '#55556a', fontFamily: 'monospace', fontSize: 10 }}>{s.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price display */}
        {currentPrice != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
              {(hoverPrice ?? currentPrice).toFixed(2)}
            </span>
            {priceChange && (
              <span style={{
                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: up ? '#22c55e' : '#ef4444',
              }}>
                {up ? '+' : ''}{priceChange.pct.toFixed(2)}%
              </span>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Chart type */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {CHART_TYPES.map(ct => (
            <button key={ct.value} onClick={() => setChartType(ct.value as typeof chartType)}
              className={`tab-btn${chartType === ct.value ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 8px' }}
            >{ct.label}</button>
          ))}
        </div>

        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {TIMEFRAMES.map(t => (
            <button key={t.label} onClick={() => setTf(t)}
              className={`tab-btn${tf.label === t.label ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 8px' }}
            >{t.label}</button>
          ))}
        </div>

        {/* Overlay toggles */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { label: 'VOL',  active: showVol,  set: setShowVol  },
            { label: 'SMA',  active: showSMA,  set: setShowSMA  },
            { label: 'EMA',  active: showEMA,  set: setShowEMA  },
            { label: 'BB',   active: showBB,   set: setShowBB   },
            { label: 'RSI',  active: showRSI,  set: setShowRSI  },
            { label: 'MACD', active: showMACD, set: setShowMACD },
          ].map(o => (
            <button key={o.label} onClick={() => o.set(v => !v)}
              className={`tab-btn${o.active ? ' active' : ''}`}
              style={{ fontSize: 10, padding: '3px 8px' }}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      {showTabs && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.055)', paddingLeft: 14 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? '#00d4aa' : 'transparent'}`,
              color: tab === t ? '#00d4aa' : '#55556a',
              fontSize: 12, fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}>{t}</button>
          ))}
          {tab === 'News' && (
            <label style={{ marginLeft: 'auto', marginRight: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={linkNews} onChange={e => setLinkNews(e.target.checked)} style={{ accentColor: '#00d4aa' }} />
              <span style={{ fontSize: 11, color: '#8888a8' }}>Link to chart</span>
            </label>
          )}
        </div>
      )}

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        {tab === 'Price' && (
          <div style={{ position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,7,14,0.6)', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', animation: `pulse-dot 1s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={containerRef} style={{ width: '100%', height }} />
          </div>
        )}

        {tab === 'News' && (
          <div style={{ padding: 16 }}>
            <NewsFeed
              defaultTicker={linkNews ? symbol : ''}
              compact={false}
            />
          </div>
        )}

        {tab === 'Calendar' && (
          <div style={{ padding: 16 }}>
            <Calendar ticker={symbol} />
          </div>
        )}

        {tab === 'AI Assistant' && (
          <div style={{ height: Math.max(height, 500) }}>
            <AssistantPanel defaultTickers={[symbol]} />
          </div>
        )}
      </div>

      {/* ── Footer legend ──────────────────────────────────────────────── */}
      {tab === 'Price' && (
        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: '#55556a', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: '#22c55e', display: 'inline-block' }} /> Bullish</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: '#ef4444', display: 'inline-block' }} /> Bearish</span>
          {showSMA  && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: '#f59e0b', display: 'inline-block' }} /> SMA 20</span>}
          {showEMA  && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: '#a78bfa', display: 'inline-block' }} /> EMA 20</span>}
          {showBB   && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: '#3b82f6', display: 'inline-block' }} /> Bollinger</span>}
          <span style={{ marginLeft: 'auto' }}>Lightweight Charts™ · Gulf Oil Desk</span>
        </div>
      )}
    </div>
  )
}
