import { useEffect, useState, type ReactNode } from 'react'
import { Sparkle, Lightbulb, Tag } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useAiTask, useCreateAiTask } from '@/hooks/use-ai-task'
import { AI_TASK_STATUS_META, AI_TASK_TYPE_META } from '@/lib/constants'
import { toast } from '@/lib/stores/toast'
import type { AiTaskType } from '@/types/ai'
import { ApiError } from '@/lib/http/request'

export function AiAssistPanel({ ticketId }: { ticketId: number }) {
  const [taskIds, setTaskIds] = useState<Partial<Record<AiTaskType, number>>>({})

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted">基于工单内容由 AI 生成，结果仅供参考</p>
      <AiTaskButton
        type="TICKET_CLASSIFICATION"
        ticketId={ticketId}
        taskId={taskIds.TICKET_CLASSIFICATION ?? null}
        onCreated={(id) => setTaskIds((prev) => ({ ...prev, TICKET_CLASSIFICATION: id }))}
        icon={<Tag size={15} />}
        label="智能分类建议"
      />
      <AiTaskButton
        type="TICKET_SOLUTION_SUGGESTION"
        ticketId={ticketId}
        taskId={taskIds.TICKET_SOLUTION_SUGGESTION ?? null}
        onCreated={(id) => setTaskIds((prev) => ({ ...prev, TICKET_SOLUTION_SUGGESTION: id }))}
        icon={<Lightbulb size={15} />}
        label="解决方案推荐"
      />
    </div>
  )
}

function AiTaskButton({
  type,
  ticketId,
  taskId,
  onCreated,
  icon,
  label,
}: {
  type: AiTaskType
  ticketId: number
  taskId: number | null
  onCreated: (id: number) => void
  icon: ReactNode
  label: string
}) {
  const createTask = useCreateAiTask()
  const [finished, setFinished] = useState(false)
  const { data } = useAiTask(taskId, taskId !== null && !finished)

  useEffect(() => {
    setFinished(false)
  }, [taskId])

  useEffect(() => {
    if (data?.status === 'SUCCESS' || data?.status === 'FAILED') setFinished(true)
  }, [data?.status])

  const running = taskId !== null && !finished

  const handleCreate = async () => {
    try {
      const result = await createTask.mutateAsync({
        taskType: type,
        businessType: 'TICKET',
        businessId: ticketId,
      })
      onCreated(result.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '任务提交失败')
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="flex items-center gap-2 text-[13px] font-medium text-strong">
          <Sparkle size={15} className="text-violet" />
          {label}
        </span>
        <Button
          size="sm"
          variant="outline"
          loading={createTask.isPending || running}
          icon={icon}
          onClick={handleCreate}
        >
          {taskId ? '重新生成' : '生成'}
        </Button>
      </div>
      {data && (
        <div className="border-t border-border-subtle px-3 py-2.5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${
              data.status === 'SUCCESS'
                ? 'bg-success-soft text-success'
                : data.status === 'FAILED'
                  ? 'bg-danger-soft text-danger'
                  : 'bg-warning-soft text-warning'
            }`}
          >
            {AI_TASK_STATUS_META[data.status].label}
          </span>
          <p className="mt-1 text-[11px] text-faint">{AI_TASK_TYPE_META[data.taskType]}</p>
          {data.output && (
            <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-muted">
              {data.output}
            </p>
          )}
          {data.errorMessage && <p className="mt-2 text-xs text-danger">{data.errorMessage}</p>}
        </div>
      )}
    </div>
  )
}
