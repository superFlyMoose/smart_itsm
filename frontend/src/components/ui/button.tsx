import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import type { Tone } from '@/lib/constants'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand text-brand-contrast hover:bg-brand-hover',
  secondary:
    'bg-brand-soft text-brand-700 hover:bg-brand-100 dark:bg-brand-900 dark:text-brand-200 dark:hover:bg-brand-800',
  outline:
    'border border-border-subtle bg-surface text-strong hover:bg-surface-alt',
  ghost: 'text-muted hover:bg-surface-alt hover:text-strong',
  danger: 'bg-danger text-white hover:opacity-90',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
}

export const toneToButton: Record<Tone, Variant> = {
  neutral: 'outline',
  brand: 'primary',
  success: 'primary',
  warning: 'primary',
  danger: 'danger',
  violet: 'primary',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <CircleNotch size={16} weight="bold" className="animate-spin" /> : icon}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
