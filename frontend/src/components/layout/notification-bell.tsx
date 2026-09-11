import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from '@phosphor-icons/react'
import { useNotifications, useNotificationMutations, useUnreadCount } from '@/hooks/use-notifications'
import { NOTIFICATION_TYPE_META } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: unread } = useUnreadCount()
  const { data, isLoading } = useNotifications({ pageNum: 1, pageSize: 5 })
  const { markRead, readAll } = useNotificationMutations()

  const count = unread?.count ?? 0

  const handleClick = (id: number, isRead: boolean, relatedType: string | null, relatedId: number | null) => {
    if (!isRead) markRead.mutate(id)
    setOpen(false)
    if (relatedType === 'TICKET' && relatedId) {
      navigate(`/tickets/${relatedId}`)
    } else if (relatedType === 'TRANSFER_REQUEST' && relatedId) {
      navigate(`/transfer-requests?focus=${relatedId}`)
    } else {
      navigate('/notifications')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="通知"
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-alt hover:text-strong"
      >
        <Bell size={19} />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-1.5 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-semibold text-strong">通知</p>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => readAll.mutate()}
                  className="text-xs text-brand hover:underline"
                >
                  全部已读
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <p className="px-4 py-8 text-center text-[13px] text-faint">加载中...</p>
              ) : data && data.records.length > 0 ? (
                data.records.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleClick(item.id, item.isRead, item.relatedType, item.relatedId)
                    }
                    className={`flex w-full flex-col gap-0.5 border-b border-border-subtle px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-alt ${
                      item.isRead ? '' : 'bg-brand-soft/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-strong">{item.title}</span>
                      {!item.isRead && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-faint">
                        {NOTIFICATION_TYPE_META[item.type] ?? item.type}
                      </span>
                      <span className="tnum text-[11px] text-faint">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-[13px] text-faint">暂无通知</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/notifications')
              }}
              className="w-full border-t border-border-subtle px-4 py-2.5 text-center text-[13px] text-brand hover:bg-surface-alt"
            >
              查看全部通知
            </button>
          </div>
        </>
      )}
    </div>
  )
}
