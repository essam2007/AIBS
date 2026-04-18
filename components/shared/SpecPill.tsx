import * as React from 'react'
import { cn } from '@/lib/utils'

type PillColor = 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray'

interface SpecPillProps {
  /** Human-readable label, e.g. "API Gravity" or "Sulfur" */
  label: string
  /** The value to display, e.g. "38.2°" or "0.3%" */
  value: string | number
  /**
   * Semantic color hint:
   *  - blue  → light crude (API ≥ 34)
   *  - green → sweet crude (sulfur < 0.5 %)
   *  - red   → sour crude  (sulfur ≥ 1 %)
   *  - amber → medium / borderline
   *  - purple, gray → misc
   */
  color?: PillColor
  className?: string
}

const COLOR_MAP: Record<PillColor, string> = {
  blue:   'bg-blue-500/15   text-blue-300   border-blue-500/30',
  green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  red:    'bg-red-500/15    text-red-300    border-red-500/30',
  amber:  'bg-amber-500/15  text-amber-300  border-amber-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  gray:   'bg-gray-500/15   text-gray-300   border-gray-500/30',
}

/**
 * SpecPill
 *
 * A compact colored pill displaying a spec label + value pair.
 *
 * Usage examples:
 *   <SpecPill label="API Gravity" value="38.2°" color="blue" />
 *   <SpecPill label="Sulfur"      value="0.3%"  color="green" />
 *   <SpecPill label="Sulfur"      value="1.8%"  color="red" />
 */
export function SpecPill({ label, value, color = 'gray', className }: SpecPillProps) {
  const colorClasses = COLOR_MAP[color] ?? COLOR_MAP.gray

  return (
    <span
      className={cn(
        // Shape & spacing
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        // Typography
        'text-xs font-medium whitespace-nowrap',
        // Color
        colorClasses,
        className,
      )}
    >
      {/* Label — slightly dimmed */}
      <span className="opacity-70">{label}</span>

      {/* Divider dot */}
      <span className="opacity-40" aria-hidden>·</span>

      {/* Value — full opacity, slightly bolder */}
      <span className="font-semibold">{value}</span>
    </span>
  )
}
