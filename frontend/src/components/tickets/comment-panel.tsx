import { useState } from 'react'
import { ChatCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/states'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useTicketComments, useTicketMutations } from '@/hooks/use-tickets'
import { ApiError } from '@/lib/http/request'

export function CommentPanel({ ticketId }: { ticketId: number }) {
  const { data, isLoading, error, refetch } = useTicketComments(ticketId)
  const mutations = useTicketMutations(ticketId)
  const [content, setContent] = useState('')

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error('评论内容不能为空')
      return
    }
    try {
      await mutations.addComment.mutateAsync({ content: trimmed })
      setContent('')
      toast.success('评论已发表')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '发表失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          rows={3}
          value={content}
          placeholder="补充问题说明或处理意见..."
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            loading={mutations.addComment.isPending}
            onClick={handleSubmit}
          >
            发表评论
          </Button>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<ChatCircle size={24} />}
            title="评论加载失败"
            action={
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                重试
              </Button>
            }
          />
        ) : data && data.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {data.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar name={comment.user.realName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium text-strong">
                      {comment.user.realName}
                    </span>
                    <span className="tnum text-xs text-faint">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-6 text-muted">
                    {comment.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<ChatCircle size={24} />} title="暂无评论" description="成为第一个补充信息的人" />
        )}
      </div>
    </div>
  )
}
