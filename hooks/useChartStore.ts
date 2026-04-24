'use client'

import { useState, useCallback } from 'react'

export interface ChartSettings {
  symbol:    string
  timeframe: string
  chartType: 'candlestick' | 'line' | 'area' | 'bar'
  overlays:  { sma: boolean; ema: boolean; bb: boolean; vwap: boolean; volume: boolean }
  indicators: { rsi: boolean; macd: boolean }
  linkedToNews: boolean
}

const DEFAULT: ChartSettings = {
  symbol:    'CL=F',
  timeframe: '6M',
  chartType: 'candlestick',
  overlays:  { sma: false, ema: false, bb: false, vwap: false, volume: true },
  indicators: { rsi: false, macd: false },
  linkedToNews: true,
}

// Saved templates (persisted to localStorage)
function loadTemplates(): Record<string, ChartSettings> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('chart-templates') ?? '{}') } catch { return {} }
}
function saveTemplates(t: Record<string, ChartSettings>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('chart-templates', JSON.stringify(t))
}

export function useChartStore() {
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT)
  const [templates, setTemplates] = useState<Record<string, ChartSettings>>(loadTemplates)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['CL=F', 'BZ=F', 'NG=F', '^GSPC']
    try { return JSON.parse(localStorage.getItem('watchlist') ?? '["CL=F","BZ=F","NG=F","^GSPC"]') } catch { return ['CL=F', 'BZ=F', 'NG=F', '^GSPC'] }
  })

  const updateSymbol = useCallback((symbol: string) => {
    setSettings(s => ({ ...s, symbol }))
  }, [])

  const updateSettings = useCallback(<K extends keyof ChartSettings>(key: K, val: ChartSettings[K]) => {
    setSettings(s => ({ ...s, [key]: val }))
  }, [])

  const saveTemplate = useCallback((name: string) => {
    const next = { ...loadTemplates(), [name]: settings }
    saveTemplates(next)
    setTemplates(next)
  }, [settings])

  const loadTemplate = useCallback((name: string) => {
    const t = loadTemplates()[name]
    if (t) setSettings(t)
  }, [])

  const addToWatchlist = useCallback((sym: string) => {
    setWatchlist(prev => {
      if (prev.includes(sym)) return prev
      const next = [...prev, sym]
      localStorage.setItem('watchlist', JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromWatchlist = useCallback((sym: string) => {
    setWatchlist(prev => {
      const next = prev.filter(s => s !== sym)
      localStorage.setItem('watchlist', JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, updateSymbol, updateSettings, templates, saveTemplate, loadTemplate, watchlist, addToWatchlist, removeFromWatchlist }
}
