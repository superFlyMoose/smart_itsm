import { useEffect, useMemo, useState } from 'react'
import {
  PencilSimple,
  PlusCircle,
  Trash,
  UserPlus,
  UsersThree,
} from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDepartmentTree, useTeamDetail, useTeams } from '@/hooks/use-meta'
import { useUsers } from '@/hooks/use-users'
import { useOrganizationMutations } from '@/hooks/use-organization'
import { flattenTree } from '@/lib/tree'
import { formatDateTime } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { ApiError } from '@/lib/http/request'
import type { TeamRecord } from '@/types/organization'

export function TeamManagePage() {
  const { data: teams, isLoading, error, refetch } = useTeams()
  const departmentTree = useDepartmentTree()
  const departmentOptions = flattenTree(departmentTree.data)
  const { data: userPage } = useUsers({ pageNum: 1, pageSize: 100, status: 'ACTIVE' })
  const mutations = useOrganizationMutations()

  const [editing, setEditing] = useState<TeamRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [removing, setRemoving] = useState<{ teamId: number; userId: number; name: string } | null>(null)

  const departmentName = (id: number) =>
    departmentOptions.find((item) => item.id === id)?.name ?? '-'

  return (
    <div>
      <PageHeader
        title="团队管理"
        description="维护处理团队、成员构成与团队负责人"
        actions={
          <Button icon={<PlusCircle size={16} />} onClick={() => setCreating(true)}>
            新建团队
          </Button>
        }
      />

      <Card>
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={5} />
        ) : teams && teams.length > 0 ? (
          <Table>
            <THead>
              <tr>
                <TH>团队名称</TH>
                <TH>所属部门</TH>
                <TH>负责人</TH>
                <TH>操作</TH>
              </tr>
            </THead>
            <TBody>
              {teams.map((team) => (
                <TR key={team.id}>
                  <TD>
                    <button
                      type="button"
                      className="flex items-center gap-2 font-medium text-strong hover:text-brand"
                      onClick={() => setDetailId(team.id)}
                    >
                      <UsersThree size={16} className="text-brand" />
                      {team.name}
                    </button>
                  </TD>
                  <TD className="text-muted">{departmentName(team.departmentId) || team.departmentName}</TD>
                  <TD className="text-muted">{team.managerName ?? '-'}</TD>
                  <TD>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDetailId(team.id)}>
                        成员管理
                      </Button>
                      <Button size="sm" variant="ghost" icon={<PencilSimple size={15} />} onClick={() => setEditing(team)}>
                        编辑
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState icon={<UsersThree size={24} />} title="暂无团队" description="新建团队以承接工单处理" />
        )}
      </Card>

      <TeamFormModal
        open={creating || !!editing}
        team={editing}
        departmentOptions={departmentOptions}
        managerOptions={userPage?.records ?? []}
        loading={mutations.saveTeam.isPending}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={async (data) => {
          try {
            await mutations.saveTeam.mutateAsync({ id: editing?.id ?? null, data })
            toast.success(editing ? '团队已更新' : '团队已创建')
            setCreating(false)
            setEditing(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '保存失败')
          }
        }}
      />

      <TeamDetailModal
        teamId={detailId}
        allUsers={userPage?.records ?? []}
        onClose={() => setDetailId(null)}
        onRemove={(payload) => setRemoving(payload)}
      />

      <ConfirmDialog
        open={!!removing}
        title="移除团队成员"
        danger
        description={`确认将「${removing?.name ?? ''}」移出该团队？`}
        confirmText="确认移除"
        loading={mutations.removeTeamMember.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return
          try {
            await mutations.removeTeamMember.mutateAsync({
              teamId: removing.teamId,
              userId: removing.userId,
            })
            toast.success('成员已移除')
            setRemoving(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '操作失败')
          }
        }}
      />
    </div>
  )
}

function TeamFormModal({
  open,
  team,
  departmentOptions,
  managerOptions,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean
  team: TeamRecord | null
  departmentOptions: { id: number; name: string; depth: number }[]
  managerOptions: { id: number; realName: string }[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: { name: string; departmentId: number; managerId: number | null }) => void
}) {
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [errors, setErrors] = useState<{ name?: string; departmentId?: string }>({})

  useEffect(() => {
    if (open) {
      setName(team?.name ?? '')
      setDepartmentId(team ? String(team.departmentId) : '')
      setManagerId(team?.managerId ? String(team.managerId) : '')
      setErrors({})
    }
  }, [open, team])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={team ? '编辑团队' : '新建团队'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              const next: typeof errors = {}
              if (!name.trim()) next.name = '请输入团队名称'
              if (!departmentId) next.departmentId = '请选择所属部门'
              setErrors(next)
              if (Object.keys(next).length === 0) {
                onSubmit({
                  name: name.trim(),
                  departmentId: Number(departmentId),
                  managerId: managerId ? Number(managerId) : null,
                })
              }
            }}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="团队名称" required error={errors.name}>
          <Input value={name} invalid={!!errors.name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="所属部门" required error={errors.departmentId}>
          <Select
            value={departmentId}
            invalid={!!errors.departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
          >
            <option value="">请选择部门</option>
            {departmentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {'　'.repeat(option.depth)}
                {option.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="团队负责人" hint="负责人需先加入团队后方可在列表中选择">
          <Select value={managerId} onChange={(event) => setManagerId(event.target.value)}>
            <option value="">暂不指定</option>
            {managerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.realName}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  )
}

function TeamDetailModal({
  teamId,
  allUsers,
  onClose,
  onRemove,
}: {
  teamId: number | null
  allUsers: { id: number; realName: string; username: string }[]
  onClose: () => void
  onRemove: (payload: { teamId: number; userId: number; name: string }) => void
}) {
  const { data: team, isLoading } = useTeamDetail(teamId)
  const mutations = useOrganizationMutations()
  const [userId, setUserId] = useState('')
  const [teamRole, setTeamRole] = useState('MEMBER')

  useEffect(() => {
    if (teamId) {
      setUserId('')
      setTeamRole('MEMBER')
    }
  }, [teamId])

  const memberIds = useMemo(() => new Set(team?.members.map((member) => member.userId)), [team])
  const candidates = allUsers.filter((user) => !memberIds.has(user.id))

  return (
    <Modal open={teamId != null} onClose={onClose} title={team ? `成员管理 - ${team.name}` : '成员管理'} width="max-w-2xl">
      {isLoading || !team ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-2 rounded-lg bg-surface-alt p-3">
            <div className="flex w-48 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-strong">添加成员</label>
              <Select value={userId} onChange={(event) => setUserId(event.target.value)}>
                <option value="">选择员工</option>
                {candidates.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.realName}（{user.username}）
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex w-32 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-strong">团队角色</label>
              <Select value={teamRole} onChange={(event) => setTeamRole(event.target.value)}>
                <option value="MEMBER">成员</option>
                <option value="LEADER">组长</option>
              </Select>
            </div>
            <Button
              icon={<UserPlus size={15} />}
              loading={mutations.addTeamMember.isPending}
              disabled={!userId}
              onClick={async () => {
                try {
                  await mutations.addTeamMember.mutateAsync({
                    teamId: team.id,
                    data: { userId: Number(userId), teamRole },
                  })
                  toast.success('成员已添加')
                  setUserId('')
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.message : '添加失败')
                }
              }}
            >
              添加
            </Button>
          </div>

          {team.members.length > 0 ? (
            <Table>
              <THead>
                <tr>
                  <TH>姓名</TH>
                  <TH>用户名</TH>
                  <TH>角色</TH>
                  <TH>加入时间</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {team.members.map((member) => (
                  <TR key={member.userId}>
                    <TD className="font-medium text-strong">{member.realName}</TD>
                    <TD className="text-muted">{member.username}</TD>
                    <TD>
                      <Badge tone={member.teamRole === 'LEADER' ? 'brand' : 'neutral'}>
                        {member.teamRole === 'LEADER' ? '组长' : '成员'}
                      </Badge>
                    </TD>
                    <TD className="tnum text-muted">{formatDateTime(member.joinedAt)}</TD>
                    <TD>
                      <button
                        type="button"
                        aria-label="移除成员"
                        className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                        onClick={() =>
                          onRemove({ teamId: team.id, userId: member.userId, name: member.realName })
                        }
                      >
                        <Trash size={16} />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState icon={<UsersThree size={24} />} title="团队暂无成员" />
          )}
        </div>
      )}
    </Modal>
  )
}
