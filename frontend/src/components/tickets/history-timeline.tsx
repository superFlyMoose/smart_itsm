import { ClockCounterClockwise } from '@phosphor-icons/react'
import { EmptyState } from '@/components/ui/states'
import { Skeleton } from '@/components/ui/skeleton'
import { ACTION_META, TICKET_STATUS_META } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { useTicketHistory } from '@/hooks/use-tickets'
import type { TicketHistory } from '@/types/ticket'

export function HistoryTimeline({ ticketId }: { ticketId: number }) {
  const { data, isLoading } = useTicketHistory(ticketId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pl-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <EmptyState icon={<ClockCounterClockwise size={24} />} title="暂无操作记录" />
  }

  return (
    <ol className="relative flex flex-col gap-5 pl-5">
      <span className="absolute bottom-1 left-[5px] top-1 w-px bg-border-subtle" aria-hidden />
      {data.map((item) => (
        <TimelineItem key={item.id} item={item} />
      ))}
    </ol>
  )
}

function TimelineItem({ item }: { item: TicketHistory }) {
  return (
    <li className="relative">
      <span
        className="absolute -left-5 top-1 size-2.5 rounded-full border-2 border-brand bg-surface"
        aria-hidden
      />
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-[13px] font-medium text-strong">
          {ACTION_META[item.action] ?? item.action}
        </span>
        <span className="text-xs text-faint">{item.operator.realName}</span>
        {(item.fromStatus || item.toStatus) && (
          <span className="text-xs text-faint">
            {item.fromStatus ? TICKET_STATUS_META[item.fromStatus].label : '无'}
            {' → '}
            {item.toStatus ? TICKET_STATUS_META[item.toStatus].label : '状态不变'}
          </span>
        )}
        <span className="tnum ml-auto text-xs text-faint">{formatDateTime(item.createdAt)}</span>
      </div>
      {item.remark && (
        <p className="mt-1 whitespace-pre-wrap break-words rounded-md bg-surface-alt px-3 py-2 text-xs leading-5 text-muted">
          {item.remark}
        </p>
      )}
    </li>
  )
}
