import { useState } from 'react'
import {
  ArrowFatLinesUp,
  CheckCircle,
  HandPointing,
  PaperPlaneRight,
  Prohibit,
  SignOut,
  Swap,
  UserSwitch,
  Wrench,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PromptDialog } from '@/components/ui/prompt-dialog'
import { AssignDialog } from './assign-dialog'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { useTicketMutations } from '@/hooks/use-tickets'
import { ApiError } from '@/lib/http/request'
import type { TicketDetail } from '@/types/ticket'

type DialogKind =
  | 'assign'
  | 'transfer'
  | 'process'
  | 'resolve'
  | 'confirm'
  | 'reject'
  | 'cancel'
  | 'nudge'
  | 'escalate'
  | null

export function TicketActions({ ticket }: { ticket: TicketDetail }) {
  const mutations = useTicketMutations(ticket.id)
  const [dialog, setDialog] = useState<DialogKind>(null)

  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const isCreator = user?.id === ticket.creator.id
  const isAssignee = user?.id === ticket.assignee?.id
  const isManager = hasPermission(['ticket:assign', 'ticket:reassign'])
  const status = ticket.status

  const run = async (task: Promise<unknown>, success: string, close = true) => {
    try {
      await task
      toast.success(success)
      if (close) setDialog(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '操作失败，请稍后重试')
    }
  }

  const cancelableStatuses = ['OPEN', 'ASSIGNED', 'PROCESSING', 'WAITING_COLLABORATION']
  const nudgeableStatuses = [
    'ASSIGNED',
    'PROCESSING',
    'WAITING_COLLABORATION',
    'WAITING_CONFIRM',
  ]
  const canCancel = cancelableStatuses.includes(status) && (isCreator || isManager)
  const canNudge = nudgeableStatuses.includes(status) && isCreator && hasPermission('ticket:nudge')
  const canEscalate = nudgeableStatuses.includes(status) && hasPermission('ticket:escalate')

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {(status === 'OPEN' || status === 'ASSIGNED') &&
          isManager &&
          hasPermission(status === 'OPEN' ? 'ticket:assign' : 'ticket:reassign') && (
            <Button size="sm" icon={<UserSwitch size={15} />} onClick={() => setDialog('assign')}>
              {status === 'OPEN' ? '分配' : '重新分配'}
            </Button>
          )}

        {status === 'ASSIGNED' && isAssignee && hasPermission('ticket:accept') && (
          <Button
            size="sm"
            icon={<CheckCircle size={15} />}
            loading={mutations.accept.isPending}
            onClick={() => run(mutations.accept.mutateAsync(), '已接受工单')}
          >
            接受工单
          </Button>
        )}

        {(status === 'ASSIGNED' || status === 'PROCESSING') &&
          isAssignee &&
          hasPermission('ticket:transfer') && (
            <Button size="sm" variant="outline" icon={<Swap size={15} />} onClick={() => setDialog('transfer')}>
              转派
            </Button>
          )}

        {status === 'PROCESSING' && isAssignee && hasPermission('ticket:process') && (
          <Button size="sm" variant="outline" icon={<Wrench size={15} />} onClick={() => setDialog('process')}>
            记录处理
          </Button>
        )}

        {status === 'PROCESSING' && isAssignee && hasPermission('ticket:resolve') && (
          <Button size="sm" variant="secondary" icon={<PaperPlaneRight size={15} />} onClick={() => setDialog('resolve')}>
            提交解决方案
          </Button>
        )}

        {status === 'WAITING_CONFIRM' && isCreator && hasPermission('ticket:confirm') && (
          <>
            <Button
              size="sm"
              icon={<CheckCircle size={15} />}
              loading={mutations.confirm.isPending}
              onClick={() => setDialog('confirm')}
            >
              确认关闭
            </Button>
            <Button size="sm" variant="outline" icon={<Prohibit size={15} />} onClick={() => setDialog('reject')}>
              拒绝方案
            </Button>
          </>
        )}

        {canNudge && (
          <Button size="sm" variant="outline" icon={<HandPointing size={15} />} onClick={() => setDialog('nudge')}>
            催办
          </Button>
        )}

        {canEscalate && (
          <Button size="sm" variant="outline" icon={<ArrowFatLinesUp size={15} />} onClick={() => setDialog('escalate')}>
            升级
          </Button>
        )}

        {canCancel && (
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-soft" icon={<SignOut size={15} />} onClick={() => setDialog('cancel')}>
            取消工单
          </Button>
        )}
      </div>

      <AssignDialog
        open={dialog === 'assign'}
        mode="assign"
        initialTeamId={ticket.team?.id}
        loading={mutations.assign.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(data) =>
          run(
            mutations.assign.mutateAsync({
              teamId: data.teamId,
              assigneeId: data.assigneeId,
              remark: data.remark,
            }),
            '工单已分配',
          )
        }
      />

      <AssignDialog
        open={dialog === 'transfer'}
        mode="transfer"
        initialTeamId={ticket.team?.id}
        loading={mutations.transfer.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(data) =>
          run(
            mutations.transfer.mutateAsync({
              targetTeamId: data.teamId,
              targetAssigneeId: data.assigneeId,
              remark: data.remark,
            }),
            '转派申请已提交',
          )
        }
      />

      <PromptDialog
        open={dialog === 'process'}
        title="记录处理过程"
        label="处理内容"
        required
        placeholder="记录本次排查或处理的具体内容"
        confirmText="提交记录"
        loading={mutations.process.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(content) =>
          run(mutations.process.mutateAsync({ content }), '处理记录已保存')
        }
      />

      <PromptDialog
        open={dialog === 'resolve'}
        title="提交解决方案"
        description="提交后工单进入待确认状态，由提交人确认关闭"
        label="解决方案"
        required
        rows={5}
        placeholder="请完整描述解决方案与操作步骤"
        confirmText="提交方案"
        loading={mutations.resolve.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(resolution) =>
          run(mutations.resolve.mutateAsync({ resolution }), '解决方案已提交')
        }
      />

      <PromptDialog
        open={dialog === 'reject'}
        title="拒绝解决方案"
        danger
        label="拒绝原因"
        required
        confirmText="确认拒绝"
        loading={mutations.reject.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(reason) =>
          run(mutations.reject.mutateAsync({ reason }), '已拒绝，工单退回处理中')
        }
      />

      <PromptDialog
        open={dialog === 'cancel'}
        title="取消工单"
        danger
        label="取消原因"
        required={false}
        placeholder="说明取消原因（可选）"
        confirmText="确认取消"
        loading={mutations.cancel.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(reason) =>
          run(mutations.cancel.mutateAsync({ reason: reason || undefined }), '工单已取消')
        }
      />

      <PromptDialog
        open={dialog === 'nudge'}
        title="催办工单"
        label="催办留言"
        required={false}
        placeholder="可填写给处理人的留言（可选）"
        confirmText="发送催办"
        loading={mutations.nudge.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(message) =>
          run(mutations.nudge.mutateAsync({ message: message || undefined }), '催办已发送')
        }
      />

      <PromptDialog
        open={dialog === 'escalate'}
        title="工单升级"
        description="升级将通知团队负责人关注处理进度"
        label="升级原因"
        required
        danger
        confirmText="确认升级"
        loading={mutations.escalate.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(reason) =>
          run(mutations.escalate.mutateAsync({ reason }), '工单已升级')
        }
      />

      <ConfirmDialog
        open={dialog === 'confirm'}
        title="确认关闭工单"
        description="确认问题已解决并关闭工单，关闭后可进行服务评价"
        confirmText="确认关闭"
        loading={mutations.confirm.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => run(mutations.confirm.mutateAsync(), '工单已关闭')}
      />
    </>
  )
}
