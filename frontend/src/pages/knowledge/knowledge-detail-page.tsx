import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowSquareOut,
  CloudArrowDown,
  PaperPlaneTilt,
  Prohibit,
} from '@phosphor-icons/react'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { KNOWLEDGE_STATUS_META } from '@/lib/constants'
import { formatDateTime, resolveFileUrl } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { useKnowledgeDetail, useKnowledgeMutations } from '@/hooks/use-knowledge'
import { ApiError } from '@/lib/http/request'

export function KnowledgeDetailPage() {
  const params = useParams<{ id: string }>()
  const documentId = Number(params.id)
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canManage = user?.roles.includes('ADMIN') || hasPermission('system:manage')

  const { data, isLoading, error, refetch } = useKnowledgeDetail(documentId)
  const mutations = useKnowledgeMutations()
  const [confirmKind, setConfirmKind] = useState<'publish' | 'offline' | null>(null)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-4 h-6 w-24" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <ErrorState
          message={error instanceof Error ? error.message : '未找到该文档或无权查看'}
          onRetry={() => void refetch()}
        />
      </Card>
    )
  }

  const runAction = async (task: Promise<unknown>, success: string) => {
    try {
      await task
      toast.success(success)
      setConfirmKind(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '操作失败')
    }
  }

  const fileUrl = resolveFileUrl(data.fileUrl)

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/knowledge"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-brand"
      >
        <ArrowLeft size={14} />
        返回知识库
      </Link>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-strong">{data.title}</h1>
                <Badge tone={KNOWLEDGE_STATUS_META[data.status].tone}>
                  {KNOWLEDGE_STATUS_META[data.status].label}
                </Badge>
              </div>
              <p className="mt-1 text-[13px] text-faint">
                {data.categoryName ? `${data.categoryName} · ` : ''}
                {data.uploaderName} · 更新于 {formatDateTime(data.updatedAt)}
              </p>
            </div>
            {canManage && (
              <div className="flex gap-2">
                {data.status !== 'PUBLISHED' && (
                  <Button
                    size="sm"
                    icon={<PaperPlaneTilt size={15} />}
                    loading={mutations.publish.isPending}
                    onClick={() => setConfirmKind('publish')}
                  >
                    发布
                  </Button>
                )}
                {data.status === 'PUBLISHED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Prohibit size={15} />}
                    loading={mutations.offline.isPending}
                    onClick={() => setConfirmKind('offline')}
                  >
                    下线
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-alt p-5">
            {fileUrl ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CloudArrowDown size={36} className="text-brand" />
                <p className="text-[13px] text-muted">该文档以外部文件形式提供，请通过链接访问</p>
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="secondary" icon={<ArrowSquareOut size={15} />}>
                    打开文档
                  </Button>
                </a>
              </div>
            ) : (
              <p className="py-4 text-center text-[13px] text-faint">
                本文档暂未关联文件，详细内容请联系上传人 {data.uploaderName}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
            <MetaItem label="文档编号" value={String(data.id)} mono />
            <MetaItem label="创建时间" value={formatDateTime(data.createdAt)} mono />
            <MetaItem label="最近更新" value={formatDateTime(data.updatedAt)} mono />
          </dl>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmKind === 'publish'}
        title="发布文档"
        description="发布后所有登录用户均可在知识库查看该文档"
        confirmText="确认发布"
        loading={mutations.publish.isPending}
        onClose={() => setConfirmKind(null)}
        onConfirm={() => runAction(mutations.publish.mutateAsync(data.id), '文档已发布')}
      />
      <ConfirmDialog
        open={confirmKind === 'offline'}
        title="下线文档"
        danger
        description="下线后普通用户将无法查看该文档"
        confirmText="确认下线"
        loading={mutations.offline.isPending}
        onClose={() => setConfirmKind(null)}
        onConfirm={() => runAction(mutations.offline.mutateAsync(data.id), '文档已下线')}
      />
    </div>
  )
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className={`mt-0.5 font-medium text-strong ${mono ? 'tnum' : ''}`}>{value}</dd>
    </div>
  )
}
