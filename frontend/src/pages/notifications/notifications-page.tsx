import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Checks } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PAGE_SIZE_OPTIONS, NOTIFICATION_TYPE_META } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import {
  useNotifications,
  useNotificationMutations,
} from '@/hooks/use-notifications'

type FilterKey = 'all' | 'unread' | 'read'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' },
]

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error, refetch } = useNotifications({
    pageNum,
    pageSize,
    isRead: filter === 'all' ? undefined : filter === 'read',
  })
  const { markRead, readAll } = useNotificationMutations()

  const handleOpen = (id: number, isRead: boolean, relatedType: string | null, relatedId: number | null) => {
    if (!isRead) markRead.mutate(id)
    if (relatedType === 'TICKET' && relatedId) {
      navigate(`/tickets/${relatedId}`)
    } else if (relatedType === 'TRANSFER_REQUEST' && relatedId) {
      navigate(`/transfer-requests?focus=${relatedId}`)
    }
  }

  return (
    <div>
      <PageHeader
        title="通知中心"
        description="工单分配、协作、SLA 预警等消息提醒"
        actions={
          <Button
            variant="outline"
            icon={<Checks size={16} />}
            loading={readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            全部已读
          </Button>
        }
      />

      <div className="mb-4 flex gap-1 rounded-lg bg-surface p-1" style={{ width: 'fit-content' }}>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setFilter(item.key)
              setPageNum(1)
            }}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
              filter === item.key ? 'bg-brand text-brand-contrast' : 'text-muted hover:text-strong'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card>
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={3} />
        ) : data && data.records.length > 0 ? (
          <>
            <ul className="divide-y divide-border-subtle">
              {data.records.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpen(item.id, item.isRead, item.relatedType, item.relatedId)
                    }
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-alt ${
                      item.isRead ? '' : 'bg-brand-soft/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                        item.isRead ? 'bg-surface-alt text-faint' : 'bg-brand-soft text-brand'
                      }`}
                    >
                      <Bell size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-[13px] ${item.isRead ? 'font-medium text-muted' : 'font-semibold text-strong'}`}>
                          {item.title}
                        </p>
                        {!item.isRead && <span className="size-1.5 rounded-full bg-danger" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{item.content}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-faint">
                        <span>{NOTIFICATION_TYPE_META[item.type] ?? item.type}</span>
                        <span className="tnum">{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <Pagination
              pageNum={data.pageNum}
              pageSize={data.pageSize}
              total={data.total}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPageNum}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPageNum(1)
              }}
            />
          </>
        ) : (
          <EmptyState icon={<Bell size={24} />} title="暂无通知" description="与你相关的工单动态会展示在这里" />
        )}
      </Card>
    </div>
  )
}
