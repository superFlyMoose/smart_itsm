import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/stores/auth'

interface RequireAuthProps {
  children: ReactNode
}

/** 登录守卫：无 Token 跳转登录页；登录成功后统一进入工作台，不做页面回跳 */
export function RequireAuth({ children }: RequireAuthProps) {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

interface RequirePermissionProps {
  /** 拥有任一权限码即可访问 */
  any: string[]
  children: ReactNode
}

/** 权限守卫：基于后端下发的权限编码做路由级控制 */
export function RequirePermission({ any, children }: RequirePermissionProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const location = useLocation()

  if (!hasPermission(any)) {
    return <Navigate to="/403" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
