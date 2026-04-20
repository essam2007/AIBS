'use client'

import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.025)',
      borderRadius: 16,
      color: '#55556a',
      fontSize: 14,
    }}>
      Loading chart...
    </div>
  ),
})

const INSTRUMENTS = [
  { value: 'CL=F', label: 'WTI Crude Oil', group: 'Energy' },
  { value: 'BZ=F', label: 'Brent Crude', group: 'Energy' },
  { value: 'NG=F', label: 'Natural Gas', group: 'Energy' },
  { value: 'HO=F', label: 'Heating Oil', group: 'Energy' },
  { value: 'GC=F', label: 'Gold', group: 'Metals' },
  { value: 'SI=F', label: 'Silver', group: 'Metals' },
  { value: '^GSPC', label: 'S&P 500', group: 'Indices' },
  { value: '^IXIC', label: 'NASDAQ', group: 'Indices' },
  { value: '^DJI', label: 'Dow Jones', group: 'Indices' },
  { value: 'BTC-USD', label: 'Bitcoin', group: 'Crypto' },
  { value: 'ETH-USD', label: 'Ethereum', group: 'Crypto' },
]

export default function ChartsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#eeeef5', marginBottom: 4 }}>Advanced Charts</h1>
        <p style={{ fontSize: 13, color: '#55556a' }}>TradingView Lightweight Charts™ · Live data · Multiple timeframes & indicators</p>
      </div>

      {/* Feature badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Candlestick', 'Line', 'Area', 'Bar Charts', 'SMA Indicator', 'Volume Histogram', 'Multiple Timeframes', 'Zoom & Pan'].map(f => (
          <span
            key={f}
            className="badge"
            style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', fontSize: 10 }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Main chart */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.055)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <TradingChart symbol="CL=F" height={560} showToolbar />
      </div>

      {/* Mini charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { symbol: 'BZ=F', title: 'Brent Crude' },
          { symbol: 'GC=F', title: 'Gold' },
          { symbol: '^GSPC', title: 'S&P 500' },
        ].map(({ symbol, title }) => (
          <div
            key={symbol}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.055)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#eeeef5' }}>{title}</span>
              <span style={{ fontSize: 10, color: '#55556a', marginLeft: 8 }}>{symbol}</span>
            </div>
            <TradingChart symbol={symbol} height={220} showToolbar={false} />
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {[
          { icon: '🖱️', tip: 'Scroll to zoom, click-drag to pan the chart' },
          { icon: '📐', tip: 'Crosshair shows OHLCV data at any point' },
          { icon: '📊', tip: 'Toggle between Candles, Line, Area, and Bar charts' },
          { icon: '📈', tip: 'Enable MA to overlay 20-period moving average' },
        ].map(({ icon, tip }) => (
          <div
            key={tip}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <p style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.5 }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
