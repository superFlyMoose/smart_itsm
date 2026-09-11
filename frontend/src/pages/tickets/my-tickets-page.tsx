import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, MagnifyingGlass, Ticket } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PriorityBadge, StatusBadge } from '@/components/tickets/ticket-badges'
import { PAGE_SIZE_OPTIONS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { ApiError } from '@/lib/http/request'
import { ticketApi } from '@/api/tickets'
import { useTickets } from '@/hooks/use-tickets'
import type { TicketQuery, TicketStatus } from '@/types/ticket'

/** 进入“我的待办”所需的任一处理权限 */
const HANDLE_PERMISSIONS: string[] = ['ticket:accept', 'ticket:view:assigned']

/** 顶部状态 Tab，空字符串表示全部 */
const STATUS_TABS: { key: TicketStatus | ''; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'ASSIGNED', label: '待接受' },
  { key: 'PROCESSING', label: '处理中' },
  { key: 'WAITING_COLLABORATION', label: '协作中' },
]

interface SearchForm {
  ticketNo: string
  title: string
}

const EMPTY_FORM: SearchForm = { ticketNo: '', title: '' }

/**
 * 页面外壳：仅工程师（有接单/查看待办权限）可浏览。
 * 无处理权限的用户通过 URL 直达时给出温馨引导，且不挂载数据组件、不发起请求。
 */
export function MyTicketsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (!hasPermission(HANDLE_PERMISSIONS)) {
    return (
      <div>
        <PageHeader title="我的待办" description="查看分配给自己、需要跟进处理的工单" />
        <Card>
          <EmptyState
            icon={<Ticket size={24} />}
            title="你没有需要处理的工单任务"
            description="“我的待办”仅面向处理工单的工程师，展示分配给他们接受与处理的工单。如需跟踪自己提交的工单进度，请前往「全部工单」。"
            action={
              <Link to="/tickets">
                <Button size="sm" icon={<MagnifyingGlass size={15} />}>
                  查看我提交的工单
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  return <MyTasksContent />
}

function MyTasksContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const qc = useQueryClient()

  const [status, setStatus] = useState<TicketStatus | ''>('ASSIGNED')
  const [form, setForm] = useState<SearchForm>(EMPTY_FORM)
  const [query, setQuery] = useState<TicketQuery>({ pageNum: 1, pageSize: 20 })

  const { data, isLoading, error, refetch, isFetching } = useTickets({
    ...query,
    assigneeId: user?.id,
    status: status || undefined,
  })

  const acceptMutation = useMutation({
    mutationFn: (ticketId: number) => ticketApi.accept(ticketId),
    onSuccess: () => {
      toast.success('已接受工单')
      void qc.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : '接受工单失败，请稍后重试')
    },
  })

  const openDetail = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`, { state: { from: location.pathname } })
  }

  const handleTabChange = (key: string) => {
    setStatus(key as TicketStatus | '')
    setQuery((prev) => ({ ...prev, pageNum: 1 }))
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery((prev) => ({
      ...prev,
      pageNum: 1,
      ticketNo: form.ticketNo.trim() || undefined,
      title: form.title.trim() || undefined,
    }))
  }

  return (
    <div>
      <PageHeader title="我的待办" description="查看分配给自己、需要跟进处理的工单" />

      <Card className="mb-4">
        <div className="border-b border-border-subtle p-3">
          <Tabs items={STATUS_TABS} active={status} onChange={handleTabChange} />
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-48 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">工单号</label>
            <Input
              value={form.ticketNo}
              placeholder="输入工单号"
              onChange={(event) => setForm((prev) => ({ ...prev, ticketNo: event.target.value }))}
            />
          </div>
          <div className="flex w-56 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">标题关键词</label>
            <Input
              value={form.title}
              placeholder="输入工单标题"
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" icon={<MagnifyingGlass size={16} />} loading={isFetching}>
              查询
            </Button>
            {(form.ticketNo || form.title) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(EMPTY_FORM)
                  setQuery((prev) => ({ pageNum: 1, pageSize: prev.pageSize }))
                }}
              >
                清空
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        {error ? (
          <ErrorState
            message={(error as Error).message}
            onRetry={() => {
              void refetch()
            }}
          />
        ) : isLoading ? (
          <TableSkeleton columns={7} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>工单号</TH>
                  <TH>标题</TH>
                  <TH>优先级</TH>
                  <TH>状态</TH>
                  <TH>创建人</TH>
                  <TH>创建时间</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((ticket) => (
                  <TR
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => openDetail(ticket.id)}
                  >
                    <TD className="tnum whitespace-nowrap text-brand">{ticket.ticketNo}</TD>
                    <TD className="max-w-[280px]">
                      <span className="line-clamp-1 font-medium text-strong">{ticket.title}</span>
                    </TD>
                    <TD>
                      <PriorityBadge priority={ticket.priority} />
                    </TD>
                    <TD>
                      <StatusBadge status={ticket.status} />
                    </TD>
                    <TD className="text-muted">{ticket.creatorName}</TD>
                    <TD className="tnum whitespace-nowrap text-muted">
                      {formatDateTime(ticket.createdAt)}
                    </TD>
                    <TD onClick={(event) => event.stopPropagation()}>
                      {ticket.status === 'ASSIGNED' ? (
                        <Button
                          size="sm"
                          icon={<CheckCircle size={15} />}
                          loading={
                            acceptMutation.isPending && acceptMutation.variables === ticket.id
                          }
                          onClick={() => acceptMutation.mutate(ticket.id)}
                        >
                          接受
                        </Button>
                      ) : ticket.status === 'PROCESSING' ||
                        ticket.status === 'WAITING_COLLABORATION' ? (
                        <Button size="sm" variant="outline" onClick={() => openDetail(ticket.id)}>
                          去处理
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => openDetail(ticket.id)}>
                          查看详情
                        </Button>
                      )}
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
          <EmptyState title="暂无待处理工单" description="当有工单分配给你时，会出现在这里" />
        )}
      </Card>
    </div>
  )
}
