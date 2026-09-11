import { NavLink } from 'react-router-dom'
import { Headset } from '@phosphor-icons/react'
import { buildNavGroups } from '@/config/navigation'
import { useAuthStore } from '@/lib/stores/auth'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user)
  const groups = buildNavGroups(user)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border-subtle bg-surface transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border-subtle px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-contrast">
            <Headset size={18} weight="fill" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-strong">Smart ITSM</p>
            <p className="text-[11px] text-faint">IT 服务管理平台</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
                {group.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact || item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                          : 'text-muted hover:bg-surface-alt hover:text-strong'
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
