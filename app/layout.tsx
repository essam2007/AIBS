import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import ClientLayout from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  title: 'Gulf Oil Desk — Global Energy Terminal',
  description: 'Professional oil & energy market terminal. Live prices, news aggregation, economic calendar, AI assistant, and deal board — all in one platform.',
  keywords: 'oil trading, crude oil, energy markets, WTI, Brent, Gulf Oil Desk',
  openGraph: {
    title: 'Gulf Oil Desk',
    description: 'The one-stop terminal for global oil markets.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <div style={{ marginLeft: 72, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  )
}
