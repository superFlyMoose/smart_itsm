import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkle, Star } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { Avatar } from '@/components/ui/avatar'
import { PriorityBadge, StatusBadge } from '@/components/tickets/ticket-badges'
import { TicketActions } from '@/components/tickets/ticket-actions'
import { CommentPanel } from '@/components/tickets/comment-panel'
import { HistoryTimeline } from '@/components/tickets/history-timeline'
import { AttachmentPanel } from '@/components/tickets/attachment-panel'
import { CollaborationPanel } from '@/components/tickets/collaboration-panel'
import { RatingPanel } from '@/components/tickets/rating-panel'
import { AiAssistPanel } from '@/components/tickets/ai-assist-panel'
import { SlaInfoCard } from '@/components/tickets/sla-info-card'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/lib/stores/auth'
import { useTicketDetail } from '@/hooks/use-tickets'

const TABS = [
  { key: 'comment', label: '沟通记录' },
  { key: 'collaboration', label: '协作' },
  { key: 'attachment', label: '附件' },
  { key: 'history', label: '操作历史' },
]

/** 与 AppLayout 中记录的来源页路径保持一致 */
const REFERRER_STORAGE_KEY = 'itsm:ticket-referrer'

export function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const ticketId = Number(params.id)
  const [tab, setTab] = useState('comment')
  const currentUser = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const navigate = useNavigate()
  const location = useLocation()

  const { data: ticket, isLoading, error, refetch } = useTicketDetail(ticketId)

  const stateFrom = (location.state as { from?: string } | null)?.from
  const referrer = stateFrom ?? sessionStorage.getItem(REFERRER_STORAGE_KEY) ?? ''
  const backLabel = referrer.startsWith('/my-tickets')
    ? '返回我的待办'
    : referrer.startsWith('/notifications')
      ? '返回通知中心'
      : '返回全部工单'

  const handleBack = () => {
    // 有浏览历史时后退；直接通过 URL 进入（新标签页/刷新后无历史）时回退到来源页或全部工单
    const historyState = window.history.state as { idx?: number } | null
    if (historyState && typeof historyState.idx === 'number' && historyState.idx > 0) {
      navigate(-1)
    } else {
      navigate(referrer || '/tickets')
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-4 h-8 w-24" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <Card>
        <ErrorState
          message={error instanceof Error ? error.message : '未找到该工单或无权查看'}
          onRetry={() => void refetch()}
        />
      </Card>
    )
  }

  const isCreator = currentUser?.id === ticket.creator.id
  const isAssignee = currentUser?.id === ticket.assignee?.id
  const canCollaborate =
    ticket.status === 'PROCESSING' && isAssignee && hasPermission('ticket:collaborate')
  const canUseAi = hasPermission(['ticket:process', 'ticket:resolve'])
  const showRating = ticket.status === 'CLOSED' && isCreator

  return (
    <div>
      <button
        type="button"
        onClick={handleBack}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </button>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="tnum text-base font-medium text-brand">{ticket.ticketNo}</span>
            <span>{ticket.title}</span>
          </span>
        }
        actions={<TicketActions ticket={ticket} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        {ticket.category && <Badge tone="neutral">{ticket.category.name}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader title="问题描述" />
            <CardBody>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted">
                {ticket.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="pb-3">
              <Tabs items={TABS} active={tab} onChange={setTab} />
            </CardBody>
            <CardBody className="pt-0">
              {tab === 'comment' && <CommentPanel ticketId={ticketId} />}
              {tab === 'collaboration' && (
                <CollaborationPanel ticketId={ticketId} canCollaborate={canCollaborate} />
              )}
              {tab === 'attachment' && <AttachmentPanel ticketId={ticketId} />}
              {tab === 'history' && <HistoryTimeline ticketId={ticketId} />}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="基本信息" />
            <CardBody className="flex flex-col gap-3 p-0">
              <InfoRow label="提交人">
                <span className="flex items-center gap-2">
                  <Avatar name={ticket.creator.realName} size="sm" />
                  {ticket.creator.realName}
                </span>
              </InfoRow>
              <InfoRow label="所属部门">{ticket.department?.name ?? '-'}</InfoRow>
              <InfoRow label="处理团队">{ticket.team?.name ?? '待分配'}</InfoRow>
              <InfoRow label="处理人">
                {ticket.assignee ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={ticket.assignee.realName} size="sm" />
                    {ticket.assignee.realName}
                  </span>
                ) : (
                  <span className="text-faint">待分配</span>
                )}
              </InfoRow>
              <InfoRow label="问题分类">{ticket.category?.name ?? '-'}</InfoRow>
              <InfoRow label="创建时间">
                <span className="tnum">{formatDateTime(ticket.createdAt)}</span>
              </InfoRow>
              <InfoRow label="首次响应">
                <span className="tnum">{formatDateTime(ticket.firstResponseAt)}</span>
              </InfoRow>
              <InfoRow label="解决时间">
                <span className="tnum">{formatDateTime(ticket.resolvedAt)}</span>
              </InfoRow>
              <InfoRow label="关闭时间">
                <span className="tnum">{formatDateTime(ticket.closedAt)}</span>
              </InfoRow>
            </CardBody>
          </Card>

          <SlaInfoCard ticketId={ticketId} />

          {showRating && (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400" weight="fill" />
                    服务评价
                  </span>
                }
              />
              <CardBody>
                <RatingPanel ticketId={ticketId} />
              </CardBody>
            </Card>
          )}

          {canUseAi && (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Sparkle size={16} className="text-violet" weight="fill" />
                    AI 辅助
                  </span>
                }
              />
              <CardBody>
                <AiAssistPanel ticketId={ticketId} />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-2.5 odd:bg-surface-alt/40">
      <span className="shrink-0 text-[13px] text-faint">{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] font-medium text-strong">
        {children}
      </span>
    </div>
  )
}
