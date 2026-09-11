import { useRef } from 'react'
import {
  DownloadSimple,
  FileText,
  Paperclip,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatFileSize, resolveFileUrl } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { useAttachments, useTicketMutations } from '@/hooks/use-tickets'
import { ApiError } from '@/lib/http/request'

export function AttachmentPanel({ ticketId }: { ticketId: number }) {
  const { data, isLoading } = useAttachments(ticketId)
  const mutations = useTicketMutations(ticketId)
  const currentUserId = useAuthStore((state) => state.user?.id)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error('文件大小不能超过 20 MB')
      return
    }
    try {
      await mutations.uploadAttachment.mutateAsync(file)
      toast.success('附件上传成功')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '上传失败')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(event) => void handleUpload(event.target.files?.[0])}
        />
        <Button
          size="sm"
          variant="outline"
          loading={mutations.uploadAttachment.isPending}
          icon={<UploadSimple size={15} />}
          onClick={() => inputRef.current?.click()}
        >
          上传附件
        </Button>
        <span className="ml-3 text-xs text-faint">单个文件不超过 20 MB</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {data.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-700">
                <FileText size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-strong">{file.fileName}</p>
                <p className="tnum text-xs text-faint">
                  {formatFileSize(file.fileSize)} · {file.uploaderName} · {formatDateTime(file.createdAt)}
                </p>
              </div>
              {resolveFileUrl(file.fileUrl) && (
                <a
                  href={resolveFileUrl(file.fileUrl) ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  download={file.fileName}
                  className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-brand"
                  aria-label="下载附件"
                >
                  <DownloadSimple size={17} />
                </a>
              )}
              {file.uploaderId === currentUserId && (
                <button
                  type="button"
                  aria-label="删除附件"
                  onClick={() => {
                    void mutations.deleteAttachment
                      .mutateAsync(file.id)
                      .then(() => toast.success('附件已删除'))
                      .catch((err) =>
                        toast.error(err instanceof ApiError ? err.message : '删除失败'),
                      )
                  }}
                  className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Paperclip size={24} />}
          title="暂无附件"
          description="可上传截图、日志等材料辅助问题定位"
        />
      )}
    </div>
  )
}
