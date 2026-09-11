import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-surface ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4 ${className}`}
    >
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-strong">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
