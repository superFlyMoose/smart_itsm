import type { ReactNode } from 'react'
import { Lock } from '@phosphor-icons/react'

interface ForbiddenStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

/** 页面内局部接口返回“无权限”时的中性提示，避免误用红色错误态 */
export function ForbiddenState({
  title = '暂无访问权限',
  description = '你当前账号没有查看此功能的权限，请联系管理员开通',
  action,
  className = '',
}: ForbiddenStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-alt text-faint">
        <Lock size={24} />
      </div>
      <p className="text-sm font-medium text-strong">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
