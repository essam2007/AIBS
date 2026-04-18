'use client'

import * as React from 'react'
import { useLangStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * LanguageToggle
 *
 * Renders a pill-style EN / AR toggle button.
 * When toggled it calls setLang on the Zustand store, which downstream
 * layout components use to set dir="rtl" on <body>.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggleLang } = useLangStore()
  const isAr = lang === 'ar'

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
      className={cn(
        // Layout
        'inline-flex items-center gap-0 rounded-full overflow-hidden',
        'h-8 text-xs font-semibold tracking-wide',
        // Border
        'border border-border',
        // Transition
        'transition-colors duration-150',
        className,
      )}
    >
      {/* EN segment */}
      <span
        className={cn(
          'flex items-center justify-center w-9 h-full transition-colors duration-150',
          !isAr
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:text-foreground',
        )}
      >
        EN
      </span>

      {/* AR segment */}
      <span
        className={cn(
          'flex items-center justify-center w-9 h-full transition-colors duration-150',
          isAr
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:text-foreground',
        )}
        // Arabic label rendered in its own script
        lang="ar"
        dir="rtl"
      >
        ع
      </span>
    </button>
  )
}
