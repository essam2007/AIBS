'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const ChartWidget = dynamic(() => import('@/components/charts/ChartWidget'), { ssr: false })

function ChartsInner() {
  const params = useSearchParams()
  const symbol = params.get('symbol') ?? 'CL=F'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>Charts</h1>
        <p style={{ fontSize: 12, color: '#55556a' }}>
          Multi-timeframe OHLC · SMA / EMA / Bollinger Bands · RSI · MACD · Integrated News, Calendar & AI tabs
        </p>
      </div>
      <ChartWidget initialSymbol={symbol} height={540} showTabs />
    </div>
  )
}

export default function ChartsPage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 600, borderRadius: 16 }} />}>
      <ChartsInner />
    </Suspense>
  )
}
