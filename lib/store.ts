import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '@/lib/translations'

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'en' ? 'ar' : 'en' }),
    }),
    {
      name: 'gulfoildesk-lang',
    },
  ),
)
