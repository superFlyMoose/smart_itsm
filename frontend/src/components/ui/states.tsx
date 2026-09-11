import type { ReactNode } from 'react'
import { Tray, WarningCircle, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from './button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-alt text-faint">
        {icon ?? <Tray size={24} />}
      </div>
      <p className="text-sm font-medium text-strong">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  message = '数据加载失败，请稍后重试',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WarningCircle size={24} />
      </div>
      <p className="text-sm font-medium text-strong">加载失败</p>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" icon={<ArrowsClockwise size={15} />} onClick={onRetry}>
          重新加载
        </Button>
      )}
    </div>
  )
}
