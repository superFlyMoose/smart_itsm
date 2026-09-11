import { forwardRef, type SelectHTMLAttributes } from 'react'
import { CaretDown } from '@phosphor-icons/react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', invalid = false, children, ...rest }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`h-9 w-full appearance-none rounded-lg border border-border-subtle bg-surface pl-3 pr-9 text-sm text-strong transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-alt ${
          invalid ? 'border-danger' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  ),
)
Select.displayName = 'Select'
