'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  /** Optional size override in pixels. Defaults to 16. */
  size?: number
  /** Additional class names for the icon wrapper */
  className?: string
}

/**
 * VerifiedBadge
 *
 * A gold checkmark icon that shows a tooltip "Verified by GulfOilDesk"
 * on hover / focus. Uses Radix Tooltip for accessibility.
 */
export function VerifiedBadge({ size = 16, className }: VerifiedBadgeProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {/* tabIndex so keyboard users can trigger the tooltip */}
          <span
            role="img"
            aria-label="Verified by GulfOilDesk"
            tabIndex={0}
            className={cn(
              'inline-flex items-center justify-center cursor-default',
              'rounded-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              className,
            )}
          >
            <CheckCircle2
              style={{ width: size, height: size }}
              className="text-primary drop-shadow-[0_0_4px_hsl(43_96%_56%/0.6)]"
              aria-hidden
            />
          </span>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className={cn(
              'z-50 overflow-hidden rounded-md',
              'border border-primary/30 bg-card px-3 py-1.5',
              'text-xs font-medium text-primary',
              'shadow-md',
              // Animations
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            Verified by GulfOilDesk
            {/* Arrow */}
            <TooltipPrimitive.Arrow className="fill-primary/30" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
