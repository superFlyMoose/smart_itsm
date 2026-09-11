import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, ChartBar, Stack, Timer, WarningOctagon } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/common/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { ForbiddenState } from '@/components/ui/forbidden-state'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { isForbiddenError } from '@/lib/http/request'
import { daysAgoString, todayString } from '@/lib/date'
import {
  useCategoryStat,
  useEngineerWorkload,
  useSlaReport,
  useTicketOverview,
  useTicketTrend,
} from '@/hooks/use-reports'

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid var(--border-subtle)',
  background: 'var(--surface)',
  fontSize: 12,
  color: 'var(--strong)',
}

export function ReportsPage() {
  const [startDate, setStartDate] = useState(daysAgoString(29))
  const [endDate, setEndDate] = useState(todayString())
  const [range, setRange] = useState({ start: startDate, end: endDate })

  const overview = useTicketOverview()
  const trend = useTicketTrend(range.start, range.end)
  const category = useCategoryStat()
  const workload = useEngineerWorkload()
  const sla = useSlaReport()

  const applyRange = () => {
    if (startDate > endDate) return
    setRange({ start: startDate, end: endDate })
  }

  if (overview.error || trend.error) {
    const forbidden =
      isForbiddenError(overview.error) || isForbiddenError(trend.error)
    return (
      <div>
        <PageHeader title="统计报表" description="工单处理效率与 SLA 达成情况分析" />
        <Card>
          {forbidden ? (
            <ForbiddenState />
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
      <PageHeader title="统计报表" description="工单处理效率与 SLA 达成情况分析" />

      {overview.isLoading || !overview.data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="工单总量" value={overview.data.total} icon={<Stack size={18} />} tone="brand" />
          <StatCard
            label="处理中（含协作）"
            value={overview.data.processing + overview.data.waitingCollaboration}
            icon={<ChartBar size={18} />}
            tone="violet"
          />
          <StatCard label="已关闭" value={overview.data.closed} icon={<Timer size={18} />} tone="success" />
          <StatCard label="已取消" value={overview.data.cancelled} icon={<WarningOctagon size={18} />} tone="neutral" />
        </div>
      )}

      <Card className="mt-4">
        <CardHeader
          title="工单趋势"
          action={
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                className="h-8 w-36"
                onChange={(event) => setStartDate(event.target.value)}
              />
              <span className="text-xs text-faint">至</span>
              <Input
                type="date"
                value={endDate}
                className="h-8 w-36"
                onChange={(event) => setEndDate(event.target.value)}
              />
              <Button size="sm" variant="outline" onClick={applyRange}>
                应用
              </Button>
            </div>
          }
        />
        <CardBody>
          {trend.isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : trend.data && trend.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trend.data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#336bef" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#336bef" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="reportClosed" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" name="新建" dataKey="createdCount" stroke="#336bef" strokeWidth={2} fill="url(#reportCreated)" />
                <Area type="monotone" name="关闭" dataKey="closedCount" stroke="#15803d" strokeWidth={2} fill="url(#reportClosed)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-80 items-center justify-center text-[13px] text-faint">
              所选时间范围内暂无数据
            </div>
          )}
        </CardBody>
      </Card>

      {sla.error ? (
        <Card className="mt-4">
          {isForbiddenError(sla.error) ? (
            <ForbiddenState />
          ) : (
            <ErrorState
              message={(sla.error as Error).message}
              onRetry={() => void sla.refetch()}
            />
          )}
        </Card>
      ) : (
        sla.data && (
          <Card className="mt-4">
            <CardHeader
              title="SLA 达标情况"
              action={
                <Link to="/sla/tickets" className="flex items-center gap-1 text-xs text-brand hover:underline">
                  查看超时工单
                  <ArrowRight size={12} />
                </Link>
              }
            />
            <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <RateItem label="纳入统计工单" value={`${sla.data.totalTickets}`} suffix="件" />
              <RateItem label="响应达标率" value={sla.data.responseComplianceRate.toFixed(1)} suffix="%" />
              <RateItem label="解决达标率" value={sla.data.resolveComplianceRate.toFixed(1)} suffix="%" />
              <div className="rounded-lg bg-surface-alt p-4">
                <p className="text-xs text-faint">超时工单</p>
                <p className="tnum mt-1 text-lg font-semibold text-danger">
                  响应 {sla.data.responseBreached} / 解决 {sla.data.resolveBreached}
                </p>
              </div>
            </CardBody>
          </Card>
        )
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="各分类工单量" />
          <CardBody>
            {category.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : category.data && category.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={category.data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="categoryName"
                    tick={{ fontSize: 11, fill: 'var(--faint)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--faint)' }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--surface-alt)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="工单量" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 items-center justify-center text-[13px] text-faint">暂无分类数据</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="工程师工作量" />
          <CardBody className="p-0">
            {workload.isLoading ? (
              <Skeleton className="m-4 h-64 w-[calc(100%-2rem)]" />
            ) : workload.data && workload.data.length > 0 ? (
              <Table>
                <THead>
                  <tr>
                    <TH>工程师</TH>
                    <TH>待接受</TH>
                    <TH>处理中</TH>
                    <TH>已解决</TH>
                    <TH>已关闭</TH>
                  </tr>
                </THead>
                <TBody>
                  {workload.data.map((item) => (
                    <TR key={item.engineerId}>
                      <TD className="font-medium text-strong">{item.engineerName}</TD>
                      <TD className="tnum text-muted">{item.assignedCount}</TD>
                      <TD className="tnum text-muted">{item.processingCount}</TD>
                      <TD className="tnum text-muted">{item.resolvedCount}</TD>
                      <TD className="tnum text-muted">{item.closedCount}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            ) : (
              <div className="flex h-72 items-center justify-center text-[13px] text-faint">暂无工程师数据</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function RateItem({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-lg bg-surface-alt p-4">
      <p className="text-xs text-faint">{label}</p>
      <p className="tnum mt-1 text-2xl font-semibold text-strong">
        {value}
        <span className="ml-0.5 text-sm font-normal text-faint">{suffix}</span>
      </p>
    </div>
  )
}
