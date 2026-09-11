import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, MagnifyingGlass, Prohibit, Swap, X } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PromptDialog } from '@/components/ui/prompt-dialog'
import {
  PAGE_SIZE_OPTIONS,
  TRANSFER_REQUEST_STATUS_META,
  TRANSFER_REQUEST_STATUS_OPTIONS,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { ApiError } from '@/lib/http/request'
import {
  useTransferRequestMutations,
  useTransferRequests,
} from '@/hooks/use-transfer-requests'
import type {
  TransferRequestQuery,
  TransferRequestRecord,
  TransferRequestStatus,
} from '@/types/ticket'

type AuditKind = 'approve' | 'reject' | 'cancel'

interface ActiveAudit {
  id: number
  kind: AuditKind
}

/** 可使用跨团队转派功能的权限：发起人（转派）或目标团队负责人（审批） */
const TRANSFER_PERMISSIONS: string[] = ['ticket:transfer', 'ticket:transfer:approve']

/**
 * 页面外壳：仅工单工程师/团队负责人可浏览。
 * 无权限用户通过 URL 或历史通知直达时给出温馨引导，不挂载数据组件、不发起请求。
 */
export function TransferRequestsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (!hasPermission(TRANSFER_PERMISSIONS)) {
    return (
      <div>
        <PageHeader title="跨团队转派" description="查看和处理跨团队工单转派申请" />
        <Card>
          <EmptyState
            icon={<Swap size={24} />}
            title="你暂无跨团队转派相关权限"
            description="跨团队转派供处理工单的工程师发起申请、目标团队负责人审批使用。普通提交人无需进入此页面，可在「全部工单」中跟踪自己的工单。"
            action={
              <div className="flex gap-2">
                <Link to="/tickets">
                  <Button size="sm" variant="outline" icon={<MagnifyingGlass size={15} />}>
                    查看全部工单
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="sm">返回工作台</Button>
                </Link>
              </div>
            }
          />
        </Card>
      </div>
    )
  }

  return <TransferRequestsContent />
}

function TransferRequestsContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasRole = useAuthStore((state) => state.hasRole)

  const [statusFilter, setStatusFilter] = useState<TransferRequestStatus | ''>('')
  const [query, setQuery] = useState<TransferRequestQuery>({ pageNum: 1, pageSize: 10 })
  const [active, setActive] = useState<ActiveAudit | null>(null)

  const { data, isLoading, error, refetch, isFetching } = useTransferRequests(query)
  const mutations = useTransferRequestMutations()

  const canApprove = hasPermission('ticket:transfer:approve')
  const isAdmin = hasRole('ADMIN')

  // 通知跳转携带 ?focus=id：定位到对应申请行并短暂高亮
  const focusId = Number(searchParams.get('focus'))
  const validFocusId = Number.isFinite(focusId) && focusId > 0 ? focusId : null
  const [highlightId, setHighlightId] = useState<number | null>(validFocusId)
  const handledFocusRef = useRef<number | null>(null)

  useEffect(() => {
    if (
      validFocusId != null &&
      handledFocusRef.current !== validFocusId &&
      data?.records.some((item) => item.id === validFocusId)
    ) {
      handledFocusRef.current = validFocusId
      setHighlightId(validFocusId)
      document
        .getElementById(`transfer-request-${validFocusId}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const timer = window.setTimeout(() => setHighlightId(null), 2000)
      return () => window.clearTimeout(timer)
    }
  }, [data, validFocusId])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery({ pageNum: 1, pageSize: query.pageSize, status: statusFilter || undefined })
  }

  const handleReset = () => {
    setStatusFilter('')
    setQuery({ pageNum: 1, pageSize: query.pageSize })
  }

  const handleAudit = async (remark: string) => {
    if (!active) return
    const payload = { id: active.id, data: { remark: remark || undefined } }
    try {
      if (active.kind === 'approve') {
        await mutations.approve.mutateAsync(payload)
        toast.success('已通过转派申请')
      } else if (active.kind === 'reject') {
        await mutations.reject.mutateAsync(payload)
        toast.success('已拒绝转派申请')
      } else {
        await mutations.cancel.mutateAsync(payload)
        toast.success('已撤销转派申请')
      }
      setActive(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '操作失败，请稍后重试')
    }
  }

  const actionLoading =
    (active?.kind === 'approve' && mutations.approve.isPending) ||
    (active?.kind === 'reject' && mutations.reject.isPending) ||
    (active?.kind === 'cancel' && mutations.cancel.isPending)

  return (
    <div>
      <PageHeader title="跨团队转派" description="查看和处理跨团队工单转派申请" />

      <Card className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">状态</label>
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as TransferRequestStatus | '')
              }
            >
              <option value="">全部状态</option>
              {TRANSFER_REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" icon={<MagnifyingGlass size={16} />} loading={isFetching}>
              查询
            </Button>
            {statusFilter && (
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
          <TableSkeleton columns={9} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table className="min-w-[1080px]">
              <THead>
                <tr>
                  <TH>工单编号</TH>
                  <TH>工单标题</TH>
                  <TH>发起人</TH>
                  <TH>原团队</TH>
                  <TH>目标团队</TH>
                  <TH>目标工程师</TH>
                  <TH>状态</TH>
                  <TH>发起时间</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((item) => (
                  <TransferRequestRow
                    key={item.id}
                    item={item}
                    highlighted={highlightId === item.id}
                    canApprove={canApprove}
                    canCancel={item.requester.id === currentUser?.id || isAdmin}
                    onOpenTicket={() => navigate(`/tickets/${item.ticketId}`)}
                    onAudit={(kind) => setActive({ id: item.id, kind })}
                  />
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
            icon={<Swap size={24} />}
            title="暂无转派申请"
            description="跨团队转派工单时，申请会出现在这里等待目标团队负责人审批"
          />
        )}
      </Card>

      <PromptDialog
        open={active?.kind === 'approve'}
        title="通过转派申请"
        description="通过后工单将转移至目标团队并分配给目标工程师"
        label="审批意见"
        required={false}
        placeholder="可填写审批意见（可选）"
        confirmText="确认通过"
        loading={actionLoading}
        onClose={() => setActive(null)}
        onSubmit={handleAudit}
      />
      <PromptDialog
        open={active?.kind === 'reject'}
        title="拒绝转派申请"
        danger
        label="拒绝原因"
        required={false}
        placeholder="可填写拒绝原因（可选）"
        confirmText="确认拒绝"
        loading={actionLoading}
        onClose={() => setActive(null)}
        onSubmit={handleAudit}
      />
      <PromptDialog
        open={active?.kind === 'cancel'}
        title="撤销转派申请"
        danger
        label="撤销原因"
        required={false}
        placeholder="可填写撤销原因（可选）"
        confirmText="确认撤销"
        loading={actionLoading}
        onClose={() => setActive(null)}
        onSubmit={handleAudit}
      />
    </div>
  )
}

function TransferRequestRow({
  item,
  highlighted,
  canApprove,
  canCancel,
  onOpenTicket,
  onAudit,
}: {
  item: TransferRequestRecord
  highlighted: boolean
  canApprove: boolean
  canCancel: boolean
  onOpenTicket: () => void
  onAudit: (kind: AuditKind) => void
}) {
  const meta = TRANSFER_REQUEST_STATUS_META[item.status]
  const pending = item.status === 'PENDING'

  return (
    <TR id={`transfer-request-${item.id}`} className={highlighted ? 'animate-pulse bg-brand-soft/40' : ''}>
      <TD>
        <button
          type="button"
          onClick={onOpenTicket}
          className="tnum whitespace-nowrap text-brand hover:underline"
        >
          {item.ticketNo}
        </button>
      </TD>
      <TD className="max-w-[220px]">
        <span className="line-clamp-1 font-medium text-strong">{item.ticketTitle}</span>
        {item.reason && (
          <span className="mt-0.5 block text-xs text-faint">事由：{item.reason}</span>
        )}
      </TD>
      <TD className="whitespace-nowrap text-muted">{item.requester.realName}</TD>
      <TD className="whitespace-nowrap text-muted">{item.fromTeam.name}</TD>
      <TD className="whitespace-nowrap text-muted">{item.toTeam.name}</TD>
      <TD className="whitespace-nowrap text-muted">{item.targetAssignee.realName}</TD>
      <TD>
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
      </TD>
      <TD className="tnum whitespace-nowrap text-muted">{formatDateTime(item.createdAt)}</TD>
      <TD>
        {pending && (
          <div className="flex items-center gap-1">
            {canApprove && (
              <>
                <Button size="sm" icon={<Check size={15} />} onClick={() => onAudit('approve')}>
                  通过
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-danger hover:bg-danger-soft"
                  icon={<Prohibit size={15} />}
                  onClick={() => onAudit('reject')}
                >
                  拒绝
                </Button>
              </>
            )}
            {canCancel && (
              <Button size="sm" variant="ghost" icon={<X size={15} />} onClick={() => onAudit('cancel')}>
                撤销
              </Button>
            )}
          </div>
        )}
      </TD>
    </TR>
  )
}
