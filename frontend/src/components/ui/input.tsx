import { forwardRef, type InputHTMLAttributes } from 'react'

const controlClass =
  'w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-strong placeholder:text-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-alt'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid = false, ...rest }, ref) => (
    <input
      ref={ref}
      className={`h-9 ${controlClass} ${invalid ? 'border-danger' : ''} ${className}`}
      {...rest}
    />
  ),
)
Input.displayName = 'Input'
