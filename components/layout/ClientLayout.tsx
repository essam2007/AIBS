'use client'

import dynamic from 'next/dynamic'
import Header from './Header'

const MarketTicker = dynamic(() => import('@/components/market/MarketTicker'), { ssr: false })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MarketTicker />
      <main style={{ flex: 1, padding: '24px', maxWidth: '100%', overflowX: 'hidden' }}>
        {children}
      </main>
    </>
  )
}
