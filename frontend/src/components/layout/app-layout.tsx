import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

/** 记录进入工单详情页前的站内路径，供详情页“返回”按钮回退与文案使用 */
const TICKET_DETAIL_PATH = /^\/tickets\/\d+/
const REFERRER_STORAGE_KEY = 'itsm:ticket-referrer'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!TICKET_DETAIL_PATH.test(location.pathname)) {
      sessionStorage.setItem(REFERRER_STORAGE_KEY, location.pathname + location.search)
    }
  }, [location.pathname, location.search])

  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-dvh flex-col lg:pl-60">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
