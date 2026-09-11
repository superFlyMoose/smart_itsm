import { CheckCircle, Timer, WarningOctagon } from '@phosphor-icons/react'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { useTicketSla } from '@/hooks/use-sla'

export function SlaInfoCard({ ticketId }: { ticketId: number }) {
  const { data, isLoading, error } = useTicketSla(ticketId)

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Timer size={16} className="text-brand" />
            SLA 时限
          </span>
        }
      />
      <CardBody className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : error || !data ? (
          <p className="text-[13px] text-faint">该工单暂无 SLA 信息</p>
        ) : (
          <>
            <DeadlineRow
              label="首次响应时限"
              deadline={data.responseDeadline}
              doneAt={data.firstResponseAt}
              breached={data.responseBreached}
            />
            <DeadlineRow
              label="解决时限"
              deadline={data.resolveDeadline}
              doneAt={data.resolvedAt}
              breached={data.resolveBreached}
            />
          </>
        )}
      </CardBody>
    </Card>
  )
}

function DeadlineRow({
  label,
  deadline,
  doneAt,
  breached,
}: {
  label: string
  deadline: string
  doneAt: string | null
  breached: boolean
}) {
  return (
    <div className="rounded-lg border border-border-subtle p-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted">{label}</span>
        {doneAt ? (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle size={14} weight="fill" />
            已达成
          </span>
        ) : breached ? (
          <span className="flex items-center gap-1 text-xs font-medium text-danger">
            <WarningOctagon size={14} weight="fill" />
            已超时
          </span>
        ) : (
          <span className="text-xs font-medium text-warning">进行中</span>
        )}
      </div>
      <p className="tnum mt-1.5 text-[13px] text-strong">截止：{formatDateTime(deadline)}</p>
      {doneAt && (
        <p className="tnum mt-0.5 text-xs text-faint">完成：{formatDateTime(doneAt)}</p>
      )}
    </div>
  )
}
