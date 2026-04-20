'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface Props {
  symbol?: string
  height?: number
  showToolbar?: boolean
}

const TIMEFRAMES = [
  { label: '1D', interval: '1m', range: '1d' },
  { label: '5D', interval: '5m', range: '5d' },
  { label: '1M', interval: '1d', range: '1mo' },
  { label: '3M', interval: '1d', range: '3mo' },
  { label: '6M', interval: '1d', range: '6mo' },
  { label: '1Y', interval: '1wk', range: '1y' },
  { label: '2Y', interval: '1wk', range: '2y' },
]

const SYMBOLS = [
  { value: 'CL=F', label: 'WTI Crude' },
  { value: 'BZ=F', label: 'Brent' },
  { value: 'NG=F', label: 'Nat Gas' },
  { value: 'GC=F', label: 'Gold' },
  { value: '^GSPC', label: 'S&P 500' },
  { value: '^IXIC', label: 'NASDAQ' },
  { value: 'BTC-USD', label: 'Bitcoin' },
  { value: 'ETH-USD', label: 'Ethereum' },
]

const CHART_TYPES = [
  { value: 'candlestick', label: 'Candles' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bars' },
]

export default function TradingChart({ symbol: initialSymbol = 'CL=F', height = 460, showToolbar = true }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<unknown>(null)
  const seriesRef = useRef<unknown>(null)
  const volumeSeriesRef = useRef<unknown>(null)

  const [symbol, setSymbol] = useState(initialSymbol)
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[4]) // 6M default
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar'>('candlestick')
  const [loading, setLoading] = useState(true)
  const [hoverData, setHoverData] = useState<{ price: number; time: string; change: number; pct: number } | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<{ abs: number; pct: number } | null>(null)
  const [showVolume, setShowVolume] = useState(true)
  const [showMA, setShowMA] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&interval=${timeframe.interval}&range=${timeframe.range}`)
      const data = await res.json()
      return data.candles as Candle[]
    } catch {
      return []
    } finally {
      setLoading(false)
    }
  }, [symbol, timeframe])

  useEffect(() => {
    let chart: unknown = null
    let isMounted = true

    const init = async () => {
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts')
      if (!chartContainerRef.current || !isMounted) return

      // Destroy existing
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove()
        chartRef.current = null
        seriesRef.current = null
        volumeSeriesRef.current = null
      }

      const container = chartContainerRef.current
      chart = createChart(container, {
        width: container.clientWidth,
        height: height - (showVolume ? 80 : 0),
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#8888a8',
          fontSize: 11,
          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: 'rgba(255,255,255,0.2)', style: 1, width: 1, labelBackgroundColor: '#1a1a2e' },
          horzLine: { color: 'rgba(255,255,255,0.2)', style: 1, width: 1, labelBackgroundColor: '#1a1a2e' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          textColor: '#8888a8',
          scaleMargins: { top: 0.1, bottom: showVolume ? 0.2 : 0.1 },
        },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      chartRef.current = chart
      const c = chart as {
        addCandlestickSeries: (opts: unknown) => unknown
        addLineSeries: (opts: unknown) => unknown
        addAreaSeries: (opts: unknown) => unknown
        addBarSeries: (opts: unknown) => unknown
        addHistogramSeries: (opts: unknown) => unknown
        subscribeCrosshairMove: (fn: (p: unknown) => void) => void
        timeScale: () => { fitContent: () => void }
        resize: (w: number, h: number) => void
        remove: () => void
      }

      // Create main series
      let mainSeries: unknown
      if (chartType === 'candlestick') {
        mainSeries = c.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: 'rgba(34,197,94,0.6)',
          wickDownColor: 'rgba(239,68,68,0.6)',
        })
      } else if (chartType === 'line') {
        mainSeries = c.addLineSeries({
          color: '#00d4aa',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        })
      } else if (chartType === 'area') {
        mainSeries = c.addAreaSeries({
          lineColor: '#00d4aa',
          topColor: 'rgba(0,212,170,0.2)',
          bottomColor: 'rgba(0,212,170,0.01)',
          lineWidth: 2,
        })
      } else {
        mainSeries = c.addBarSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
        })
      }
      seriesRef.current = mainSeries

      // Volume series
      if (showVolume) {
        const volSeries = c.addHistogramSeries({
          color: 'rgba(255,255,255,0.1)',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        })
        ;(chart as { priceScale: (id: string) => { applyOptions: (opts: unknown) => void } }).priceScale('volume').applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        })
        volumeSeriesRef.current = volSeries
      }

      // Load and set data
      const candles = await loadData()
      if (!isMounted || candles.length === 0) return

      const s = mainSeries as { setData: (d: unknown[]) => void }
      if (chartType === 'candlestick' || chartType === 'bar') {
        s.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })))
      } else {
        s.setData(candles.map(c => ({ time: c.time, value: c.close })))
      }

      if (showVolume && volumeSeriesRef.current) {
        const vs = volumeSeriesRef.current as { setData: (d: unknown[]) => void }
        vs.setData(candles.map(c => ({
          time: c.time,
          value: c.volume ?? 0,
          color: c.close >= c.open ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
        })))
      }

      // Moving average (SMA 20)
      if (showMA && candles.length >= 20) {
        const maSeries = c.addLineSeries({
          color: '#f59e0b',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        const maData = candles.slice(19).map((_, i) => {
          const slice = candles.slice(i, i + 20)
          const avg = slice.reduce((s, c) => s + c.close, 0) / 20
          return { time: candles[i + 19].time, value: avg }
        })
        ;(maSeries as { setData: (d: unknown[]) => void }).setData(maData)
      }

      // Set price stats
      const last = candles[candles.length - 1]
      const first = candles[0]
      if (last && first) {
        setCurrentPrice(last.close)
        const abs = last.close - first.close
        setPriceChange({ abs, pct: (abs / first.close) * 100 })
      }

      c.timeScale().fitContent()

      // Crosshair subscription
      c.subscribeCrosshairMove((param: unknown) => {
        const p = param as {
          time?: number
          seriesData?: Map<unknown, { value?: number; open?: number; close?: number }>
        }
        if (!p.time || !p.seriesData) {
          setHoverData(null)
          return
        }
        const d = p.seriesData.get(mainSeries)
        if (!d) return
        const price = d.close ?? d.value ?? 0
        const time = new Date(p.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        setHoverData({ price, time, change: 0, pct: 0 })
      })

      // Resize observer
      const ro = new ResizeObserver(entries => {
        if (entries[0] && chartRef.current) {
          const { width } = entries[0].contentRect
          ;(chartRef.current as { resize: (w: number, h: number) => void }).resize(width, height - (showVolume ? 80 : 0))
        }
      })
      ro.observe(container)
    }

    init()

    return () => {
      isMounted = false
      if (chartRef.current) {
        try { (chartRef.current as { remove: () => void }).remove() } catch {}
        chartRef.current = null
      }
    }
  }, [symbol, timeframe, chartType, showVolume, showMA, height, loadData])

  const up = (priceChange?.pct ?? 0) >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {showToolbar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {/* Symbol selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              style={{ height: 30, padding: '0 8px', fontSize: 13, fontWeight: 600, minWidth: 120 }}
            >
              {SYMBOLS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {currentPrice != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', fontVariantNumeric: 'tabular-nums' }}>
                  {hoverData ? hoverData.price.toFixed(2) : currentPrice.toFixed(2)}
                </span>
                {priceChange && (
                  <span
                    className={up ? 'bg-up' : 'bg-down'}
                    style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}
                  >
                    {up ? '+' : ''}{priceChange.pct.toFixed(2)}%
                  </span>
                )}
                {hoverData && (
                  <span style={{ fontSize: 11, color: '#55556a' }}>{hoverData.time}</span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Chart type */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
              {CHART_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setChartType(ct.value as typeof chartType)}
                  className={`tab-btn${chartType === ct.value ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '3px 10px' }}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            {/* Timeframes */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.label}
                  onClick={() => setTimeframe(tf)}
                  className={`tab-btn${timeframe.label === tf.label ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Indicators */}
            <button
              onClick={() => setShowMA(v => !v)}
              className={`tab-btn${showMA ? ' active' : ''}`}
              style={{ fontSize: 11, padding: '3px 10px' }}
            >
              MA
            </button>

            <button
              onClick={() => setShowVolume(v => !v)}
              className={`tab-btn${showVolume ? ' active' : ''}`}
              style={{ fontSize: 11, padding: '3px 10px' }}
            >
              VOL
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(7,7,14,0.6)',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#00d4aa',
                    animation: `pulse-dot 1s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div
          ref={chartContainerRef}
          className="chart-container"
          style={{ height: height - (showVolume ? 0 : 0), width: '100%' }}
        />
      </div>

      {/* Footer: price scale legend */}
      <div style={{
        display: 'flex',
        gap: 20,
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: 10,
        color: '#55556a',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 2, background: '#22c55e', display: 'inline-block', borderRadius: 1 }} />
          Bullish
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 2, background: '#ef4444', display: 'inline-block', borderRadius: 1 }} />
          Bearish
        </span>
        {showMA && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 2, background: '#f59e0b', display: 'inline-block', borderRadius: 1 }} />
            SMA 20
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          Powered by Lightweight Charts™
        </span>
      </div>
    </div>
  )
}
