import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center">
      <p className="tnum text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-4 text-lg font-semibold text-strong">页面不存在</h1>
      <p className="mt-1 text-sm text-muted">该地址可能已被移除，或链接本身有误</p>
      <Link to="/" className="mt-6">
        <Button variant="outline" icon={<ArrowLeft size={15} />}>
          返回仪表盘
        </Button>
      </Link>
    </div>
  )
}
