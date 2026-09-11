import { forwardRef, type TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', invalid = false, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-strong placeholder:text-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-alt ${
        invalid ? 'border-danger' : ''
      } ${className}`}
      {...rest}
    />
  ),
)
Textarea.displayName = 'Textarea'
