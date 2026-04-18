import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        /** Gold — default */
        default: [
          'border-transparent bg-primary/20 text-primary',
        ],
        /** Subtle secondary */
        secondary: [
          'border-border bg-secondary text-secondary-foreground',
        ],
        /** Red */
        destructive: [
          'border-transparent bg-destructive/20 text-red-400',
        ],
        /** Outlined gold */
        outline: [
          'border-primary/40 bg-transparent text-primary',
        ],
        /** Success green */
        success: [
          'border-transparent bg-emerald-500/20 text-emerald-400',
        ],
        /** Warning amber */
        warning: [
          'border-transparent bg-amber-500/20 text-amber-400',
        ],
        /** Info blue */
        info: [
          'border-transparent bg-blue-500/20 text-blue-400',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
