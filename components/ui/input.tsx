import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Layout & sizing
          'flex h-10 w-full rounded-md px-3 py-2 text-sm',
          // Dark-theme colours
          'bg-secondary border border-border text-foreground',
          'placeholder:text-muted-foreground',
          // File input
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          // Focus — gold glow
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'focus-visible:border-primary/60',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          // RTL: logical padding already handled by px-3
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
