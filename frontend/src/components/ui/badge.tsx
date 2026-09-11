import type { ReactNode } from 'react'
import type { Tone } from '@/lib/constants'

const toneClass: Record<Tone, string> = {
  neutral:
    'bg-surface-alt text-muted border-border-subtle dark:text-muted',
  brand: 'bg-brand-soft text-brand-700 dark:text-brand-300',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  violet: 'bg-violet-soft text-violet',
}

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
  /** 圆点语义指示，仅用于真实状态 */
  dot?: boolean
}

export function Badge({ tone = 'neutral', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]} ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
