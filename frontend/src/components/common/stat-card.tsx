import type { ReactNode } from 'react'
import type { Tone } from '@/lib/constants'

const iconTone: Record<Tone, string> = {
  neutral: 'bg-surface-alt text-faint',
  brand: 'bg-brand-soft text-brand-700',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  violet: 'bg-violet-soft text-violet-700',
}

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  tone?: Tone
  hint?: string
}

export function StatCard({ label, value, icon, tone = 'brand', hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconTone[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="tnum mt-2 text-2xl font-semibold tracking-tight text-strong">{value}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  )
}
