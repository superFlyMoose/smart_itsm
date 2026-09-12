import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Funnel, Info, MagnifyingGlass, PlusCircle, Eye, X } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PriorityBadge, StatusBadge } from '@/components/tickets/ticket-badges'
import { PAGE_SIZE_OPTIONS, PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '@/lib/constants'
import { flattenTree } from '@/lib/tree'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/lib/stores/auth'
import { useTickets } from '@/hooks/use-tickets'
import { useCategoryTree, useTeamDetail, useTeams } from '@/hooks/use-meta'
import type { TicketPriority, TicketQuery, TicketStatus } from '@/types/ticket'

interface FilterForm {
  title: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
  categoryId: string
  teamId: string
  assigneeId: string
  startTime: string
  endTime: string
}

const EMPTY_FORM: FilterForm = {
  title: '',
  status: '',
  priority: '',
  categoryId: '',
  teamId: '',
  assigneeId: '',
  startTime: '',
  endTime: '',
}

export function TicketListPage() {
  const navigate = useNavigate()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const categoryTree = useCategoryTree()
  const categoryOptions = flattenTree(categoryTree.data)

  const [form, setForm] = useState<FilterForm>(EMPTY_FORM)
  const [query, setQuery] = useState<TicketQuery>({ pageNum: 1, pageSize: 10 })

  // 团队负责人/有派单权限者可按团队与处理人筛选；选中团队后联动加载该团队工程师
  const canFilterAssignee = hasPermission(['ticket:view:team', 'ticket:assign'])
  // 无任何处理类权限的用户（普通提交人）只能看到与自己相关的工单，给予数据范围提示
  const isTicketHandler = hasPermission([
    'ticket:accept',
    'ticket:view:assigned',
    'ticket:view:team',
    'ticket:assign',
  ])
  const { data: teams } = useTeams(canFilterAssignee)
  const { data: teamDetail } = useTeamDetail(
    canFilterAssignee && form.teamId ? Number(form.teamId) : null,
  )

  const { data, isLoading, error, refetch, isFetching } = useTickets(query)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize,
      title: form.title.trim() || undefined,
      status: form.status || undefined,
      priority: form.priority || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      teamId: canFilterAssignee && form.teamId ? Number(form.teamId) : undefined,
      assigneeId: canFilterAssignee && form.assigneeId ? Number(form.assigneeId) : undefined,
      startTime: form.startTime ? `${form.startTime} 00:00:00` : undefined,
      endTime: form.endTime ? `${form.endTime} 23:59:59` : undefined,
    })
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setQuery({ pageNum: 1, pageSize: query.pageSize })
  }

  const activeFilterCount =
    Number(!!form.title) +
    Number(!!form.status) +
    Number(!!form.priority) +
    Number(!!form.categoryId) +
    Number(!!form.teamId) +
    Number(!!form.assigneeId) +
    Number(!!form.startTime) +
    Number(!!form.endTime)

  return (
    <div>
      <PageHeader
        title="全部工单"
        description="查询与跟踪所有你有权查看的工单"
        actions={
          hasPermission('ticket:create') && (
            <Link to="/tickets/new">
              <Button icon={<PlusCircle size={16} />}>新建工单</Button>
            </Link>
          )
        }
      />

      {!isTicketHandler && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-soft px-4 py-3 text-[13px] text-brand-700">
          <Info size={16} className="mt-px shrink-0" />
          <span>这里仅展示与你相关的工单（你提交或参与的）；如需处理分配给你的任务，请等待管理员开通工程师权限后查看「我的待办」。</span>
        </div>
      )}

      <Card className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-56 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">标题关键词</label>
            <Input
              value={form.title}
              placeholder="输入工单标题"
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="flex w-36 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">状态</label>
            <Select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as TicketStatus | '' }))
              }
            >
              <option value="">全部状态</option>
              {TICKET_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex w-32 flex-col gap-1.5">
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
          <div className="flex w-44 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">分类</label>
            <Select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">全部分类</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {'　'.repeat(option.depth)}
                  {option.name}
                </option>
              ))}
            </Select>
          </div>
          {canFilterAssignee && (
            <>
              <div className="flex w-44 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-strong">处理团队</label>
                <Select
                  value={form.teamId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, teamId: event.target.value, assigneeId: '' }))
                  }
                >
                  <option value="">全部团队</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex w-40 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-strong">处理人</label>
                <Select
                  value={form.assigneeId}
                  disabled={!form.teamId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, assigneeId: event.target.value }))
                  }
                >
                  <option value="">{form.teamId ? '全部处理人' : '请先选择团队'}</option>
                  {teamDetail?.members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.realName}
                      {member.teamRole === 'LEADER' ? '（组长）' : ''}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">创建开始</label>
            <Input
              type="date"
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
            />
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">创建结束</label>
            <Input
              type="date"
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" icon={<MagnifyingGlass size={16} />} loading={isFetching}>
              查询
            </Button>
            {activeFilterCount > 0 && (
              <Button type="button" variant="outline" icon={<X size={15} />} onClick={handleReset}>
                重置
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
          <TableSkeleton columns={8} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>工单号</TH>
                  <TH>标题</TH>
                  <TH>状态</TH>
                  <TH>优先级</TH>
                  <TH>分类</TH>
                  <TH>处理人</TH>
                  <TH>创建时间</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((ticket) => (
                  <TR
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TD className="tnum whitespace-nowrap text-[13px] text-brand">{ticket.ticketNo}</TD>
                    <TD className="max-w-[280px]">
                      <span className="line-clamp-1 font-medium text-strong">{ticket.title}</span>
                      <span className="mt-0.5 block text-xs text-faint">
                        提交人：{ticket.creatorName}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={ticket.status} />
                    </TD>
                    <TD>
                      <PriorityBadge priority={ticket.priority} />
                    </TD>
                    <TD className="text-muted">{ticket.categoryName ?? '-'}</TD>
                    <TD className="text-muted">{ticket.assigneeName ?? '待分配'}</TD>
                    <TD className="tnum whitespace-nowrap text-muted">
                      {formatDateTime(ticket.createdAt)}
                    </TD>
                    <TD className="whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Eye size={15} />}
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(`/tickets/${ticket.id}`)
                        }}
                      >
                        查看详情
                      </Button>
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
              onPageSizeChange={(size) => setQuery((prev) => ({ ...prev, pageNum: 1, pageSize: size }))}
            />
          </>
        ) : (
          <EmptyState
            icon={<Funnel size={24} />}
            title="没有符合条件的工单"
            description="调整筛选条件，或提交一个新的服务请求"
            action={
              hasPermission('ticket:create') ? (
                <Link to="/tickets/new">
                  <Button size="sm" icon={<PlusCircle size={15} />}>
                    新建工单
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}
      </Card>
    </div>
  )
}
