'use client'

import { useEffect, useRef, memo } from 'react'

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void
    }
  }
}

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  height?: number | string
  containerId?: string
}

function TradingViewChart({
  symbol = 'TVC:UKOIL',
  interval = 'D',
  height = '100%',
  containerId = 'tradingview_main',
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<unknown>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const uniqueId = `${containerId}_${Date.now()}`
    container.id = uniqueId

    function initWidget() {
      if (!window.TradingView) return
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: 'Asia/Dubai',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0a0a0f',
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: true,
        calendar: true,
        hotlist: true,
        details: true,
        studies: [
          'MASimple@tv-basicstudies',
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies',
          'BB@tv-basicstudies',
          'Volume@tv-basicstudies',
        ],
        show_popup_button: false,
        popup_width: '1000',
        popup_height: '650',
        container_id: uniqueId,
        overrides: {
          'paneProperties.background': '#0a0a0f',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.gridLinesMode': 'both',
          'paneProperties.horzGridProperties.color': '#1c1c26',
          'paneProperties.vertGridProperties.color': '#1c1c26',
          'scalesProperties.textColor': '#71717a',
          'scalesProperties.lineColor': '#1c1c26',
        },
        studies_overrides: {
          'volume.volume.color.0': 'rgba(239,68,68,0.4)',
          'volume.volume.color.1': 'rgba(16,185,129,0.4)',
        },
      })
    }

    if (window.TradingView) {
      initWidget()
    } else {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = initWidget
      scriptRef.current = script
      document.head.appendChild(script)
    }

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [symbol, interval, containerId])

  return (
    <div
      ref={containerRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      className="tradingview-widget-container rounded-lg overflow-hidden"
    />
  )
}

export default memo(TradingViewChart)
