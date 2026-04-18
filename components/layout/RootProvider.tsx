'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { useLangStore } from '@/lib/store'

interface RootProviderProps {
  children: React.ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  const lang = useLangStore((s) => s.lang)

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  return <SessionProvider>{children}</SessionProvider>
}
