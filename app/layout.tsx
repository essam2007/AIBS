import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { RootProvider } from '@/components/layout/RootProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'GulfOilDesk | منصة خليج للنفط',
  description:
    'The Gulf\'s #1 platform for trading crude oil and refined petroleum products — منصة التداول النفطي الأولى في الخليج لشراء وبيع المنتجات النفطية مع وسطاء موثقين.',
  keywords: [
    'oil trading',
    'Gulf',
    'crude oil',
    'petroleum',
    'DMCC',
    'GCC',
    'نفط',
    'خليج',
    'تداول نفطي',
  ],
  openGraph: {
    title: 'GulfOilDesk | منصة خليج للنفط',
    description:
      'Buy, sell and broker crude oil and refined products across the GCC with verified counterparties.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <RootProvider>
            {children}
            <Toaster />
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
