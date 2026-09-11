import { useState, type FormEvent } from 'react'
import { PencilSimple, PlusCircle, Prohibit, ShieldCheck, Users } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'
import { UserFormModal, type UserFormPayload } from '@/components/admin/user-form-modal'
import { UserRoleDialog } from '@/components/admin/user-role-dialog'
import { PAGE_SIZE_OPTIONS, ROLE_META, USER_STATUS_META } from '@/lib/constants'
import { flattenTree } from '@/lib/tree'
import { useDepartmentTree } from '@/hooks/use-meta'
import { useUserMutations, useUsers } from '@/hooks/use-users'
import { toast } from '@/lib/stores/toast'
import { ApiError } from '@/lib/http/request'
import type { UserQuery, UserRecord, UserStatus } from '@/types/organization'

interface FilterForm {
  username: string
  realName: string
  departmentId: string
  status: UserStatus | ''
}

export function UserManagePage() {
  const departmentTree = useDepartmentTree()
  const departmentOptions = flattenTree(departmentTree.data)

  const [form, setForm] = useState<FilterForm>({
    username: '',
    realName: '',
    departmentId: '',
    status: '',
  })
  const [query, setQuery] = useState<UserQuery>({ pageNum: 1, pageSize: 10 })
  const { data, isLoading, error, refetch, isFetching } = useUsers(query)
  const mutations = useUserMutations()

  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [roleTarget, setRoleTarget] = useState<UserRecord | null>(null)
  const [disabling, setDisabling] = useState<UserRecord | null>(null)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize,
      username: form.username.trim() || undefined,
      realName: form.realName.trim() || undefined,
      departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      status: form.status || undefined,
    })
  }

  const handleSubmit = async (payload: UserFormPayload) => {
    try {
      if (editing) {
        await mutations.updateUser.mutateAsync({ userId: editing.id, data: payload })
        toast.success('用户信息已更新')
      } else {
        await mutations.createUser.mutateAsync(payload as Parameters<typeof mutations.createUser.mutateAsync>[0])
        toast.success('用户已创建')
      }
      setCreating(false)
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '保存失败')
    }
  }

  return (
    <div>
      <PageHeader
        title="用户管理"
        description="维护员工账号、所属部门与系统角色"
        actions={
          <Button icon={<PlusCircle size={16} />} onClick={() => setCreating(true)}>
            新建用户
          </Button>
        }
      />

      <Card className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">用户名</label>
            <Input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">姓名</label>
            <Input
              value={form.realName}
              onChange={(event) => setForm((prev) => ({ ...prev, realName: event.target.value }))}
            />
          </div>
          <div className="flex w-44 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">部门</label>
            <Select
              value={form.departmentId}
              onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
            >
              <option value="">全部部门</option>
              {departmentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {'　'.repeat(option.depth)}
                  {option.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex w-32 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">状态</label>
            <Select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as UserStatus | '' }))
              }
            >
              <option value="">全部</option>
              <option value="ACTIVE">正常</option>
              <option value="DISABLED">已禁用</option>
            </Select>
          </div>
          <Button type="submit" loading={isFetching}>
            查询
          </Button>
        </form>
      </Card>

      <Card>
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={8} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>工号</TH>
                  <TH>用户名</TH>
                  <TH>姓名</TH>
                  <TH>部门</TH>
                  <TH>角色</TH>
                  <TH>联系方式</TH>
                  <TH>状态</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((user) => (
                  <TR key={user.id}>
                    <TD className="tnum text-muted">{user.employeeNo}</TD>
                    <TD className="font-medium text-strong">{user.username}</TD>
                    <TD className="text-strong">{user.realName}</TD>
                    <TD className="text-muted">{user.departmentName ?? '-'}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role} tone="brand">
                              {ROLE_META[role] ?? role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-faint">-</span>
                        )}
                      </div>
                    </TD>
                    <TD className="text-muted">
                      <span className="block">{user.phone ?? '-'}</span>
                      <span className="block text-xs text-faint">{user.email ?? ''}</span>
                    </TD>
                    <TD>
                      <Badge tone={USER_STATUS_META[user.status].tone}>
                        {USER_STATUS_META[user.status].label}
                      </Badge>
                    </TD>
                    <TD>
                      <Dropdown
                        label={`${user.realName}的操作`}
                      >
                        {(close) => (
                          <>
                            <DropdownItem
                              icon={<PencilSimple size={16} />}
                              onSelect={() => {
                                close()
                                setEditing(user)
                              }}
                            >
                              编辑
                            </DropdownItem>
                            <DropdownItem
                              icon={<ShieldCheck size={16} />}
                              onSelect={() => {
                                close()
                                setRoleTarget(user)
                              }}
                            >
                              分配角色
                            </DropdownItem>
                            {user.status === 'ACTIVE' && (
                              <DropdownItem
                                icon={<Prohibit size={16} />}
                                danger
                                onSelect={() => {
                                  close()
                                  setDisabling(user)
                                }}
                              >
                                禁用账号
                              </DropdownItem>
                            )}
                          </>
                        )}
                      </Dropdown>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination
              pageNum={data.pageNum}
              pageSize={data.pageSize}
              total={data.total}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={(page) => setQuery((prev) => ({ ...prev, pageNum: page }))}
              onPageSizeChange={(size) =>
                setQuery((prev) => ({ ...prev, pageNum: 1, pageSize: size }))
              }
            />
          </>
        ) : (
          <EmptyState icon={<Users size={24} />} title="没有符合条件的用户" />
        )}
      </Card>

      <UserFormModal
        open={creating || !!editing}
        user={editing}
        departmentOptions={departmentOptions}
        loading={mutations.createUser.isPending || mutations.updateUser.isPending}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />

      <UserRoleDialog
        open={!!roleTarget}
        user={roleTarget}
        loading={mutations.assignRoles.isPending}
        onClose={() => setRoleTarget(null)}
        onSubmit={async (roleIds) => {
          if (!roleTarget) return
          try {
            await mutations.assignRoles.mutateAsync({ userId: roleTarget.id, roleIds })
            toast.success('角色已更新')
            setRoleTarget(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '分配失败')
          }
        }}
      />

      <ConfirmDialog
        open={!!disabling}
        title="禁用用户账号"
        danger
        description={`确认禁用「${disabling?.realName ?? ''}」的账号？禁用后该用户将无法登录系统`}
        confirmText="确认禁用"
        loading={mutations.disableUser.isPending}
        onClose={() => setDisabling(null)}
        onConfirm={async () => {
          if (!disabling) return
          try {
            await mutations.disableUser.mutateAsync(disabling.id)
            toast.success('账号已禁用')
            setDisabling(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '操作失败')
          }
        }}
      />
    </div>
  )
}
