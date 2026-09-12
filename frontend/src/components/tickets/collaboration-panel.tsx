import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersThree, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Skeleton } from '@/components/ui/skeleton'
import { CollaborationStatusBadge } from './ticket-badges'
import { CollaborateDialog } from './collaborate-dialog'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { useCollaborations, useTicketMutations } from '@/hooks/use-tickets'
import { ApiError } from '@/lib/http/request'

export function CollaborationPanel({
  ticketId,
  canCollaborate,
}: {
  ticketId: number
  canCollaborate: boolean
}) {
  const navigate = useNavigate()
  const { data, isLoading } = useCollaborations(ticketId)
  const mutations = useTicketMutations(ticketId)
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [dialogOpen, setDialogOpen] = useState(false)

  const runAction = async (task: Promise<unknown>, success: string) => {
    try {
      await task
      toast.success(success)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '操作失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canCollaborate && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" icon={<UsersThree size={15} />} onClick={() => setDialogOpen(true)}>
            发起协作
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {data.map((item) => {
            const mine = item.collaborator.id === currentUserId
            return (
              <li
                key={item.id}
                className="rounded-lg border border-border-subtle p-3.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium text-strong">
                    {item.collaborator.realName}
                  </span>
                  <span className="text-xs text-faint">协作人</span>
                  <CollaborationStatusBadge status={item.status} />
                  <span className="tnum ml-auto text-xs text-faint">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-faint">邀请人：{item.requester.realName}</p>
                {item.message && (
                  <p className="mt-2 rounded-md bg-surface-alt px-3 py-2 text-[13px] leading-6 text-muted">
                    {item.message}
                  </p>
                )}
                {mine && item.status === 'PENDING' && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      loading={mutations.acceptCollaboration.isPending}
                      onClick={() =>
                        runAction(
                          mutations.acceptCollaboration.mutateAsync(item.id),
                          '已接受协作',
                        )
                      }
                    >
                      接受协作
                    </Button>
                  </div>
                )}
                {mine && item.status === 'PROCESSING' && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<CheckCircle size={15} />}
                      loading={mutations.completeCollaboration.isPending}
                      onClick={async () => {
                        await runAction(
                          mutations.completeCollaboration.mutateAsync(item.id),
                          '协作已完成',
                        )
                        // 协作人完成协作后状态变 COMPLETED，随即失去该工单查看权，
                        // 停留详情页会 403，故主动跳转回工单列表
                        navigate('/tickets')
                      }}
                    >
                      完成协作
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<UsersThree size={24} />}
          title="暂无协作记录"
          description={canCollaborate ? '可邀请其他工程师协助处理' : '处理过程中可发起跨团队协作'}
        />
      )}

      <CollaborateDialog
        open={dialogOpen}
        loading={mutations.createCollaboration.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(payload) =>
          runAction(
            mutations.createCollaboration.mutateAsync(payload),
            '协作邀请已发送',
          ).then(() => setDialogOpen(false))
        }
      />
    </div>
  )
}
