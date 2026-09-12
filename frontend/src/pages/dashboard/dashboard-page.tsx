import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ClockCountdown,
  Eye,
  PlusCircle,
  Stack,
  Ticket,
  Tray,
  UsersThree,
} from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/common/stat-card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { ForbiddenState } from '@/components/ui/forbidden-state'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { StatusBadge } from '@/components/tickets/ticket-badges'
import { TICKET_STATUS_META } from '@/lib/constants'
import { daysAgoString, todayString } from '@/lib/date'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/lib/stores/auth'
import { isForbiddenError } from '@/lib/http/request'
import { ticketApi } from '@/api/tickets'
import {
  useCategoryStat,
  useEngineerWorkload,
  useTicketOverview,
  useTicketTrend,
} from '@/hooks/use-reports'
import type { TicketOverview } from '@/types/report'

const RANGE_OPTIONS = [
  { label: '近 7 天', days: 6 },
  { label: '近 14 天', days: 13 },
  { label: '近 30 天', days: 29 },
]

const STATUS_BAR_COLORS: Record<string, string> = {
  brand: '#2457e0',
  warning: '#b45309',
  success: '#15803d',
  danger: '#dc2626',
  violet: '#6d42d4',
  neutral: '#8a94a6',
}

export function DashboardPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (hasPermission('report:view')) {
    return <ReportDashboard />
  }
  return <UserDashboard />
}

/** 统计仪表盘：需要 report:view 权限 */
function ReportDashboard() {
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [rangeDays, setRangeDays] = useState(6)

  const overview = useTicketOverview()
  const trend = useTicketTrend(daysAgoString(rangeDays), todayString())
  const category = useCategoryStat()
  const workload = useEngineerWorkload()

  const pending = overview.isLoading || trend.isLoading
  const error = overview.error || trend.error
  const canHandleTicket = hasPermission(['ticket:accept', 'ticket:view:assigned'])

  if (error && !pending) {
    return (
      <div>
        <PageHeader title={`你好，${user?.realName ?? ''}`} description="以下是当前 IT 服务的运行概览" />
        <Card>
          {isForbiddenError(error) ? (
            <ForbiddenState
              title="暂无统计查看权限"
              description="你的账号无统计查看权限，可前往「我的待办」处理分配给你的任务"
              action={
                canHandleTicket ? (
                  <Link to="/my-tickets">
                    <Button size="sm" icon={<Tray size={15} />}>
                      前往我的待办
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ErrorState
              onRetry={() => {
                void overview.refetch()
                void trend.refetch()
              }}
            />
          )}
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`你好，${user?.realName ?? ''}`}
        description="以下是当前 IT 服务的运行概览"
        actions={
          <Link to="/tickets/new">
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
            >
              <PlusCircle size={16} />
              提交工单
            </button>
          </Link>
        }
      />

      {overview.isLoading || !overview.data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="工单总量"
            value={overview.data.total}
            icon={<Stack size={18} />}
            tone="brand"
          />
          <StatCard
            label="待处理"
            value={pendingCount(overview.data)}
            icon={<ClockCountdown size={18} />}
            tone="warning"
            hint="待分配、待接受与待确认"
          />
          <StatCard
            label="处理与协作中"
            value={overview.data.processing + overview.data.waitingCollaboration}
            icon={<UsersThree size={18} />}
            tone="violet"
          />
          <StatCard
            label="已关闭"
            value={overview.data.closed}
            icon={<CheckCircle size={18} />}
            tone="success"
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="工单趋势"
            action={
              <div className="flex gap-1">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => setRangeDays(option.days)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      rangeDays === option.days
                        ? 'bg-brand-soft text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'text-muted hover:bg-surface-alt'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody>
            {trend.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : trend.data && trend.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={288}>
                <AreaChart data={trend.data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#336bef" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#336bef" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="closedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#15803d" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#15803d" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'var(--faint)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'var(--faint)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface)',
                      fontSize: 12,
                      color: 'var(--strong)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    name="新建"
                    dataKey="createdCount"
                    stroke="#336bef"
                    strokeWidth={2}
                    fill="url(#createdFill)"
                  />
                  <Area
                    type="monotone"
                    name="关闭"
                    dataKey="closedCount"
                    stroke="#15803d"
                    strokeWidth={2}
                    fill="url(#closedFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 items-center justify-center text-[13px] text-faint">
                所选时间范围内暂无数据
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="状态分布" />
          <CardBody>
            {overview.isLoading || !overview.data ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <StatusDistribution overview={overview.data} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="分类工单量"
            action={
              <Link to="/tickets" className="text-xs text-brand hover:underline">
                查看全部工单
              </Link>
            }
          />
          <CardBody>
            {category.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : category.data && category.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart
                  data={category.data.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--border-subtle)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'var(--faint)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    width={84}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--surface-alt)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface)',
                      fontSize: 12,
                      color: 'var(--strong)',
                    }}
                  />
                  <Bar dataKey="count" name="工单量" fill="var(--brand)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 items-center justify-center text-[13px] text-faint">
                暂无分类统计
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="工程师负载" />
          <CardBody className="p-0">
            {workload.isLoading ? (
              <Skeleton className="m-4 h-64 w-[calc(100%-2rem)]" />
            ) : workload.data && workload.data.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {workload.data.slice(0, 6).map((item) => {
                  const active = item.assignedCount + item.processingCount
                  return (
                    <li key={item.engineerId} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-strong">{item.engineerName}</p>
                        <p className="text-xs text-faint">
                          待处理 {active} · 已解决 {item.resolvedCount}
                        </p>
                      </div>
                      <span
                        className={`tnum rounded-full px-2.5 py-1 text-xs font-medium ${
                          active > 0 ? 'bg-brand-soft text-brand-700' : 'bg-surface-alt text-faint'
                        }`}
                      >
                        {active}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex h-72 items-center justify-center text-[13px] text-faint">
                暂无工程师数据
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {canHandleTicket ? (
          <QuickEntry to="/my-tickets" icon={<Tray size={18} />} title="我的待办" description="查看分配给我的任务" />
        ) : (
          <QuickEntry to="/tickets" icon={<Ticket size={18} />} title="我的工单" description="查看我提交与参与的工单" />
        )}
        <QuickEntry to="/knowledge" icon={<BookOpen size={18} />} title="知识库" description="检索常见问题与解决方案" />
        <QuickEntry to="/tickets/new" icon={<PlusCircle size={18} />} title="提交请求" description="向 IT 服务台发起新工单" />
      </div>
    </div>
  )
}

/** 用户工作台：无 report:view 权限的普通用户首页 */
function UserDashboard() {
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const navigate = useNavigate()
  const location = useLocation()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets', 'my-created', 'dashboard'],
    queryFn: () => ticketApi.page({ creatorId: user?.id, pageNum: 1, pageSize: 5 }),
  })

  return (
    <div>
      <PageHeader
        title={`你好，${user?.realName ?? ''}`}
        description="在这里提交服务请求，并跟踪你提交过的工单进度"
        actions={
          hasPermission('ticket:create') ? (
            <Link to="/tickets/new">
              <Button icon={<PlusCircle size={16} />}>提交工单</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {hasPermission('ticket:create') && (
          <QuickEntry to="/tickets/new" icon={<PlusCircle size={18} />} title="提交请求" description="向 IT 服务台发起新工单" />
        )}
        {hasPermission(['ticket:accept', 'ticket:view:assigned']) ? (
          <QuickEntry to="/my-tickets" icon={<Tray size={18} />} title="我的待办" description="查看分配给我的处理任务" />
        ) : (
          <QuickEntry to="/tickets" icon={<Ticket size={18} />} title="我的工单" description="跟踪我提交的工单与处理进度" />
        )}
        <QuickEntry to="/knowledge" icon={<BookOpen size={18} />} title="知识库" description="检索常见问题与解决方案" />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="我最近提交的工单"
          action={
            <Link to="/tickets" className="text-xs text-brand hover:underline">
              查看全部
            </Link>
          }
        />
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={5} />
        ) : data && data.records.length > 0 ? (
          <Table>
            <THead>
              <tr>
                <TH>工单号</TH>
                <TH>标题</TH>
                <TH>状态</TH>
                <TH>创建时间</TH>
                <TH>操作</TH>
              </tr>
            </THead>
            <TBody>
              {data.records.map((ticket) => (
                <TR
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/tickets/${ticket.id}`, { state: { from: location.pathname } })
                  }
                >
                  <TD className="tnum whitespace-nowrap text-brand">{ticket.ticketNo}</TD>
                  <TD className="max-w-[360px]">
                    <span className="line-clamp-1 font-medium text-strong">{ticket.title}</span>
                  </TD>
                  <TD>
                    <StatusBadge status={ticket.status} />
                  </TD>
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
                        navigate(`/tickets/${ticket.id}`, { state: { from: location.pathname } })
                      }}
                    >
                      查看工单
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            icon={<Ticket size={24} />}
            title="你还没有提交过工单"
            description="遇到 IT 问题时，随时可以发起服务请求"
            action={
              hasPermission('ticket:create') ? (
                <Link to="/tickets/new">
                  <Button size="sm" icon={<PlusCircle size={15} />}>
                    提交工单
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

function pendingCount(overview: TicketOverview): number {
  return overview.open + overview.assigned + overview.waitingConfirm
}

function StatusDistribution({ overview }: { overview: TicketOverview }) {
  const data = [
    { key: 'OPEN', value: overview.open },
    { key: 'ASSIGNED', value: overview.assigned },
    { key: 'PROCESSING', value: overview.processing },
    { key: 'WAITING_COLLABORATION', value: overview.waitingCollaboration },
    { key: 'WAITING_CONFIRM', value: overview.waitingConfirm },
    { key: 'CLOSED', value: overview.closed },
    { key: 'CANCELLED', value: overview.cancelled },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-[13px] text-faint">暂无工单</div>
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="key"
          innerRadius={56}
          outerRadius={92}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((item) => (
            <Cell key={item.key} fill={STATUS_BAR_COLORS[TICKET_STATUS_META[item.key as keyof typeof TICKET_STATUS_META].tone]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, key) => [value, TICKET_STATUS_META[key as keyof typeof TICKET_STATUS_META]?.label ?? key]}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
            fontSize: 12,
            color: 'var(--strong)',
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {TICKET_STATUS_META[value as keyof typeof TICKET_STATUS_META]?.label ?? value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function QuickEntry({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-brand"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-700">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-strong">{title}</p>
        <p className="text-xs text-faint">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </Link>
  )
}
