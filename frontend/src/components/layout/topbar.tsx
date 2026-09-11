import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Moon, SignOut, Sun, UserCircle } from '@phosphor-icons/react'
import { useAuthStore } from '@/lib/stores/auth'
import { authApi } from '@/api/auth'
import { queryClient } from '@/lib/query-client'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'
import { NotificationBell } from './notification-bell'

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('itsm-theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // JWT 无状态，接口失败也清除本地凭证
    }
    clearAuth()
    // 账号切换时清空上一个账号的查询缓存与页面来源记录，
    // 避免新账号看到旧账号的缓存数据或被带回其最后浏览的页面
    queryClient.clear()
    sessionStorage.removeItem('itsm:ticket-referrer')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border-subtle bg-surface/90 px-3 backdrop-blur sm:px-5">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-alt lg:hidden"
        aria-label="打开菜单"
      >
        <List size={20} />
      </button>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setDark((value) => !value)}
        className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-alt hover:text-strong"
        aria-label="切换主题"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <NotificationBell />

      <Dropdown
        trigger={
          <span className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-alt">
            <Avatar name={user?.realName ?? '?'} size="sm" />
            <span
              title={user?.realName}
              className="hidden max-w-[140px] truncate whitespace-nowrap text-[13px] font-medium text-strong md:inline"
            >
              {user?.realName}
            </span>
          </span>
        }
      >
        {(close) => (
          <>
            <div className="border-b border-border-subtle px-3 py-2">
              <p className="text-sm font-medium text-strong">{user?.realName}</p>
              <p className="text-xs text-faint">@{user?.username}</p>
            </div>
            <div className="p-1">
              <DropdownItem
                icon={<UserCircle size={16} />}
                onSelect={() => {
                  close()
                  navigate('/profile')
                }}
              >
                个人中心
              </DropdownItem>
              <DropdownItem
                icon={<SignOut size={16} />}
                danger
                onSelect={() => {
                  close()
                  void handleLogout()
                }}
              >
                退出登录
              </DropdownItem>
            </div>
          </>
        )}
      </Dropdown>
    </header>
  )
}
