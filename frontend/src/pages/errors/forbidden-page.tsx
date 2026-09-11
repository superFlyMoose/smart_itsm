import { useNavigate } from 'react-router-dom'
import { ShieldWarning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <ShieldWarning size={28} />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-strong">无权访问该页面</h1>
      <p className="mt-1 text-sm text-muted">当前账号缺少访问此功能所需的权限，请联系系统管理员</p>
      <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
        返回仪表盘
      </Button>
    </div>
  )
}
