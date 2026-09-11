import type { ReactNode } from 'react'

interface FieldProps {
  label?: ReactNode
  required?: boolean
  error?: string | null
  hint?: string
  children: ReactNode
  className?: string
}

/** 表单字段：标签在上方，错误提示在输入框下方 */
export function Field({ label, required, error, hint, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[13px] font-medium text-strong">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  )
}
