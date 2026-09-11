import { useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useTicketMutations, useTicketRating } from '@/hooks/use-tickets'
import { ApiError } from '@/lib/http/request'

/** 工单关闭后由提交人评价；已有评价则只读展示 */
export function RatingPanel({ ticketId }: { ticketId: number }) {
  const { data, isLoading } = useTicketRating(ticketId, true)
  const mutations = useTicketMutations(ticketId)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')

  if (isLoading) return <Skeleton className="h-28 w-full" />

  if (data) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <StarRating value={data.score} readOnly size={18} />
          <span className="tnum text-xs text-faint">{formatDateTime(data.createdAt)}</span>
        </div>
        {data.comment && (
          <p className="rounded-md bg-surface-alt px-3 py-2 text-[13px] leading-6 text-muted">
            {data.comment}
          </p>
        )}
      </div>
    )
  }

  const handleSubmit = async () => {
    if (score < 1) {
      toast.error('请先选择星级')
      return
    }
    try {
      await mutations.rate.mutateAsync({ score, comment: comment.trim() || undefined })
      toast.success('评价已提交')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '评价失败')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <StarRating value={score} onChange={setScore} />
        <span className="text-xs text-faint">
          {score > 0 ? ['', '非常差', '较差', '一般', '满意', '非常满意'][score] : '点击星星评分'}
        </span>
      </div>
      <Textarea
        rows={3}
        value={comment}
        placeholder="补充评价内容（可选）"
        onChange={(event) => setComment(event.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          icon={<Star size={15} weight="fill" />}
          loading={mutations.rate.isPending}
          onClick={handleSubmit}
        >
          提交评价
        </Button>
      </div>
    </div>
  )
}
