import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles shared by all variants
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /** Gold — primary CTA */
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-[hsl(43_96%_48%)]',
          'active:bg-[hsl(43_96%_42%)]',
          'shadow-sm',
        ],
        /** Muted surface */
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-[hsl(222_30%_16%)]',
          'border border-border',
        ],
        /** Red destructive */
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-[hsl(0_72%_44%)]',
          'shadow-sm',
        ],
        /** Outlined — gold border */
        outline: [
          'border border-primary/50 bg-transparent text-primary',
          'hover:bg-primary/10 hover:border-primary',
        ],
        /** Transparent */
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-muted hover:text-foreground',
        ],
        /** Inline link */
        link: [
          'bg-transparent text-primary underline-offset-4',
          'hover:underline',
          'p-0 h-auto',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8  px-3 text-xs',
        lg:      'h-11 px-8 text-base',
        xl:      'h-12 px-10 text-base',
        icon:    'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (Radix Slot) */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
