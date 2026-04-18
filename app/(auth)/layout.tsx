import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[hsl(222_47%_4%)]" />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(43 96% 56%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(38 90% 50%) 0%, transparent 70%)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(43 96% 56% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(43 96% 56% / 0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <span className="text-3xl text-primary leading-none group-hover:opacity-80 transition-opacity">⬡</span>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-foreground text-lg tracking-tight">GulfOilDesk</span>
          <span className="text-[11px] text-primary/70 font-medium tracking-wider">خليج النفط</span>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md px-4">
        <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/40 border border-border">
          {children}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-muted-foreground/50 text-center">
        Registered with DMCC · Dubai, UAE · © 2026 GulfOilDesk
      </p>
    </div>
  )
}
