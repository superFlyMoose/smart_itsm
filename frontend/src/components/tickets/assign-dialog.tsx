import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useTeams, useTeamDetail } from '@/hooks/use-meta'

interface AssignDialogProps {
  open: boolean
  /** assign=首次分配/重新分配，transfer=工程师转派 */
  mode: 'assign' | 'transfer'
  initialTeamId?: number | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { teamId: number; assigneeId: number; remark?: string }) => void
}

export function AssignDialog({
  open,
  mode,
  initialTeamId,
  loading = false,
  onClose,
  onSubmit,
}: AssignDialogProps) {
  const { data: teams } = useTeams()
  const [teamId, setTeamId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (open) {
      setTeamId(initialTeamId ? String(initialTeamId) : '')
      setAssigneeId('')
      setRemark('')
    }
  }, [open, initialTeamId])

  const { data: teamDetail } = useTeamDetail(open && teamId ? Number(teamId) : null)

  const handleSubmit = () => {
    if (!teamId || !assigneeId) return
    onSubmit({
      teamId: Number(teamId),
      assigneeId: Number(assigneeId),
      remark: remark.trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'assign' ? '分配处理团队与工程师' : '转派工单'}
      description={mode === 'transfer' ? '转派后工单将回到待接受状态' : undefined}
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button loading={loading} disabled={!teamId || !assigneeId} onClick={handleSubmit}>
            确认{mode === 'assign' ? '分配' : '转派'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="处理团队" required>
          <Select
            value={teamId}
            onChange={(event) => {
              setTeamId(event.target.value)
              setAssigneeId('')
            }}
          >
            <option value="">请选择团队</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}（{team.departmentName}）
              </option>
            ))}
          </Select>
        </Field>
        <Field label="处理工程师" required>
          <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
            <option value="">请选择工程师</option>
            {teamDetail?.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.realName}
                  {member.teamRole === 'LEADER' ? '（组长）' : ''}
                </option>
              ))}
          </Select>
          {!!teamId && teamDetail?.members.length === 0 && (
            <p className="text-xs text-danger">该团队暂无成员，请先在团队管理中添加成员</p>
          )}
        </Field>
        <Field label="备注">
          <Textarea
            rows={3}
            value={remark}
            placeholder="分配或转派说明（可选）"
            onChange={(event) => setRemark(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
