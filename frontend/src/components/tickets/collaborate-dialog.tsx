import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useUsers } from '@/hooks/use-users'
import { useAuthStore } from '@/lib/stores/auth'

interface CollaborateDialogProps {
  open: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { collaboratorId: number; message?: string }) => void
}

export function CollaborateDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
}: CollaborateDialogProps) {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const { data } = useUsers({ pageNum: 1, pageSize: 100, status: 'ACTIVE' })
  const [collaboratorId, setCollaboratorId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open) {
      setCollaboratorId('')
      setMessage('')
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="发起协作"
      description="邀请其他工程师协助处理，工单进入协作中状态"
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={loading}
            disabled={!collaboratorId}
            onClick={() =>
              onSubmit({
                collaboratorId: Number(collaboratorId),
                message: message.trim() || undefined,
              })
            }
          >
            发起协作
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="协作人" required>
          <Select
            value={collaboratorId}
            onChange={(event) => setCollaboratorId(event.target.value)}
          >
            <option value="">请选择协作人</option>
            {data?.records
              .filter((user) => user.id !== currentUserId)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.realName}（{user.username}
                  {user.departmentName ? ` · ${user.departmentName}` : ''}）
                </option>
              ))}
          </Select>
        </Field>
        <Field label="协作说明">
          <Textarea
            rows={4}
            value={message}
            placeholder="说明需要协作的具体内容（可选）"
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
