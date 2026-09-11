import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Funnel, MagnifyingGlass, X } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { ForbiddenState } from '@/components/ui/forbidden-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PriorityBadge, StatusBadge } from '@/components/tickets/ticket-badges'
import { PAGE_SIZE_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants'
import { isForbiddenError } from '@/lib/http/request'
import { formatDateTime } from '@/lib/format'
import { useSlaTickets } from '@/hooks/use-sla'
import type { SlaTicketQuery } from '@/types/sla'
import type { TicketPriority } from '@/types/ticket'

type BreachFilter = '' | 'breached' | 'normal'

interface FilterForm {
  priority: TicketPriority | ''
  response: BreachFilter
  resolve: BreachFilter
}

export function SlaTicketsPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FilterForm>({ priority: '', response: '', resolve: '' })
  const [query, setQuery] = useState<SlaTicketQuery>({ pageNum: 1, pageSize: 10 })
  const { data, isLoading, error, refetch, isFetching } = useSlaTickets(query)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize,
      priority: form.priority || undefined,
      responseBreached: toBoolean(form.response),
      resolveBreached: toBoolean(form.resolve),
    })
  }

  const handleReset = () => {
    setForm({ priority: '', response: '', resolve: '' })
    setQuery({ pageNum: 1, pageSize: query.pageSize })
  }

  return (
    <div>
      <PageHeader title="SLA 监控" description="跟踪各工单响应与解决时限的达成情况" />

      <Card className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">优先级</label>
            <Select
              value={form.priority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priority: event.target.value as TicketPriority | '' }))
              }
            >
              <option value="">全部级别</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <BreachSelect
            label="首次响应"
            value={form.response}
            onChange={(value) => setForm((prev) => ({ ...prev, response: value }))}
          />
          <BreachSelect
            label="解决时限"
            value={form.resolve}
            onChange={(value) => setForm((prev) => ({ ...prev, resolve: value }))}
          />
          <div className="flex gap-2">
            <Button type="submit" icon={<MagnifyingGlass size={16} />} loading={isFetching}>
              查询
            </Button>
            {(form.priority || form.response || form.resolve) && (
              <Button type="button" variant="outline" icon={<X size={15} />} onClick={handleReset}>
                重置
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        {error ? (
          isForbiddenError(error) ? (
            <ForbiddenState />
          ) : (
            <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
          )
        ) : isLoading ? (
          <TableSkeleton columns={8} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>工单号</TH>
                  <TH>标题</TH>
                  <TH>优先级</TH>
                  <TH>状态</TH>
                  <TH>处理人</TH>
                  <TH>首次响应</TH>
                  <TH>解决时限</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((item) => (
                  <TR
                    key={item.ticketId}
                    className="cursor-pointer"
                    onClick={() => navigate(`/tickets/${item.ticketId}`)}
                  >
                    <TD className="tnum whitespace-nowrap text-brand">{item.ticketNo}</TD>
                    <TD className="max-w-[240px]">
                      <span className="line-clamp-1 font-medium text-strong">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-faint">{item.teamName ?? '未分配团队'}</span>
                    </TD>
                    <TD>
                      <PriorityBadge priority={item.priority} />
                    </TD>
                    <TD>
                      <StatusBadge status={item.status} />
                    </TD>
                    <TD className="text-muted">{item.assigneeName ?? '待分配'}</TD>
                    <TD>
                      <SlaCell
                        deadline={item.responseDeadline}
                        doneAt={item.firstResponseAt}
                        breached={item.responseBreached}
                      />
                    </TD>
                    <TD>
                      <SlaCell
                        deadline={item.resolveDeadline}
                        doneAt={item.resolvedAt}
                        breached={item.resolveBreached}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination
              pageNum={data.pageNum}
              pageSize={data.pageSize}
              total={data.total}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={(page) => setQuery((prev) => ({ ...prev, pageNum: page }))}
              onPageSizeChange={(size) =>
                setQuery((prev) => ({ ...prev, pageNum: 1, pageSize: size }))
              }
            />
          </>
        ) : (
          <EmptyState
            icon={<Funnel size={24} />}
            title="没有符合条件的工单"
            description="尝试调整 SLA 筛选条件"
            action={
              <Link to="/sla/rules">
                <Button size="sm" variant="outline">
                  查看 SLA 规则
                </Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  )
}

function BreachSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: BreachFilter
  onChange: (value: BreachFilter) => void
}) {
  return (
    <div className="flex w-36 flex-col gap-1.5">
      <label className="text-[13px] font-medium text-strong">{label}</label>
      <Select value={value} onChange={(event) => onChange(event.target.value as BreachFilter)}>
        <option value="">全部</option>
        <option value="normal">正常</option>
        <option value="breached">已超时</option>
      </Select>
    </div>
  )
}

function SlaCell({
  deadline,
  doneAt,
  breached,
}: {
  deadline: string
  doneAt: string | null
  breached: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="tnum whitespace-nowrap text-[13px] text-strong">
        {doneAt ? formatDateTime(doneAt) : formatDateTime(deadline)}
      </span>
      {doneAt ? (
        <Badge tone="success">已达成</Badge>
      ) : breached ? (
        <Badge tone="danger" dot>
          已超时
        </Badge>
      ) : (
        <Badge tone="warning">进行中</Badge>
      )}
    </div>
  )
}

function toBoolean(value: BreachFilter): boolean | undefined {
  if (value === 'breached') return true
  if (value === 'normal') return false
  return undefined
}
