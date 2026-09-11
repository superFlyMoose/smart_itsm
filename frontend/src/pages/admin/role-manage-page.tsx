import { useEffect, useMemo, useState } from 'react'
import { PlusCircle, ShieldCheck } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { usePermissions, useRoles } from '@/hooks/use-meta'
import { useOrganizationMutations } from '@/hooks/use-organization'
import { toast } from '@/lib/stores/toast'
import { ApiError } from '@/lib/http/request'
import { useAuthStore } from '@/lib/stores/auth'
import type { Permission } from '@/types/organization'

const GROUP_LABEL: Record<string, string> = {
  ticket: '工单管理',
  sla: 'SLA 管理',
  report: '报表管理',
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
  department: '部门管理',
  team: '团队管理',
  category: '分类管理',
  system: '系统管理',
}

export function RoleManagePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('role:manage')
  const canAssign = hasPermission('permission:manage')

  const { data: roles, isLoading, error, refetch } = useRoles()
  const { data: permissions } = usePermissions()
  const mutations = useOrganizationMutations()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)

  const selectedRole = roles?.find((role) => role.id === selectedId) ?? null

  useEffect(() => {
    if (selectedRole) {
      setChecked(new Set(selectedRole.permissions?.map((item) => item.id) ?? []))
    }
  }, [selectedRole])

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions])

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGroup = (items: Permission[]) => {
    setChecked((prev) => {
      const next = new Set(prev)
      const allSelected = items.every((item) => next.has(item.id))
      items.forEach((item) => {
        if (allSelected) next.delete(item.id)
        else next.add(item.id)
      })
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedRole) return
    try {
      await mutations.assignRolePermissions.mutateAsync({
        roleId: selectedRole.id,
        permissionIds: Array.from(checked),
      })
      toast.success('权限配置已保存')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '保存失败')
    }
  }

  return (
    <div>
      <PageHeader
        title="角色权限"
        description="维护系统角色并为角色分配功能权限"
        actions={
          canCreate && (
            <Button icon={<PlusCircle size={16} />} onClick={() => setCreateOpen(true)}>
              新建角色
            </Button>
          )
        }
      />

      {error ? (
        <Card>
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader title="角色列表" />
            <div className="p-2">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : roles && roles.length > 0 ? (
                roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedId(role.id)}
                    className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selectedId === role.id
                        ? 'bg-brand-soft text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'text-strong hover:bg-surface-alt'
                    }`}
                  >
                    <span>
                      <span className="block text-[13px] font-medium">{role.roleName}</span>
                      <span className="tnum block text-xs text-faint">{role.roleCode}</span>
                    </span>
                    <Badge tone="neutral">{role.permissions?.length ?? 0}</Badge>
                  </button>
                ))
              ) : (
                <EmptyState icon={<ShieldCheck size={24} />} title="暂无角色" />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={selectedRole ? `权限配置 - ${selectedRole.roleName}` : '权限配置'}
              description={selectedRole?.description ?? undefined}
              action={
                selectedRole && canAssign ? (
                  <Button size="sm" loading={mutations.assignRolePermissions.isPending} onClick={handleSave}>
                    保存配置
                  </Button>
                ) : undefined
              }
            />
            <CardBody>
              {!selectedRole ? (
                <EmptyState
                  icon={<ShieldCheck size={28} />}
                  title="请选择左侧角色"
                  description="选择角色后查看并配置其功能权限"
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {groupedPermissions.map((group) => {
                    const selectedCount = group.items.filter((item) => checked.has(item.id)).length
                    return (
                      <div key={group.key}>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-strong">
                            {GROUP_LABEL[group.key] ?? group.key}
                            <span className="tnum ml-2 text-xs font-normal text-faint">
                              {selectedCount}/{group.items.length}
                            </span>
                          </p>
                          {canAssign && (
                            <button
                              type="button"
                              className="text-xs text-brand hover:underline"
                              onClick={() => toggleGroup(group.items)}
                            >
                              {selectedCount === group.items.length ? '取消全选' : '全选'}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {group.items.map((item) => (
                            <label
                              key={item.id}
                              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[13px] ${
                                checked.has(item.id)
                                  ? 'border-brand bg-brand-soft/40'
                                  : 'border-border-subtle'
                              } ${canAssign ? 'cursor-pointer hover:bg-surface-alt' : 'cursor-default'}`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 size-4 accent-[var(--brand)]"
                                checked={checked.has(item.id)}
                                disabled={!canAssign}
                                onChange={() => toggle(item.id)}
                              />
                              <span>
                                <span className="block font-medium text-strong">
                                  {item.permissionName}
                                </span>
                                <span className="tnum block text-xs text-faint">
                                  {item.permissionCode}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      <CreateRoleModal
        open={createOpen}
        loading={mutations.createRole.isPending}
        onClose={() => setCreateOpen(false)}
        onCreated={(roleId) => {
          setCreateOpen(false)
          setSelectedId(roleId)
        }}
      />
    </div>
  )
}

interface PermissionGroup {
  key: string
  items: Permission[]
}

function groupPermissions(permissions: Permission[] | undefined): PermissionGroup[] {
  const map = new Map<string, Permission[]>()
  permissions?.forEach((item) => {
    const key = item.permissionCode.split(':')[0]
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  })
  return Array.from(map.entries()).map(([key, items]) => ({ key, items }))
}

function CreateRoleModal({
  open,
  loading,
  onClose,
  onCreated,
}: {
  open: boolean
  loading: boolean
  onClose: () => void
  onCreated: (roleId: number) => void
}) {
  const mutations = useOrganizationMutations()
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ roleCode?: string; roleName?: string }>({})

  useEffect(() => {
    if (open) {
      setRoleCode('')
      setRoleName('')
      setDescription('')
      setErrors({})
    }
  }, [open])

  const handleSubmit = async () => {
    const next: typeof errors = {}
    if (!/^[A-Z0-9_]+$/.test(roleCode.trim())) next.roleCode = '角色编码仅支持大写字母、数字与下划线'
    if (!roleName.trim()) next.roleName = '请输入角色名称'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    try {
      const id = await mutations.createRole.mutateAsync({
        roleCode: roleCode.trim(),
        roleName: roleName.trim(),
        description: description.trim() || undefined,
      })
      toast.success('角色已创建')
      onCreated(id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '创建失败')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新建角色"
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            创建
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="角色编码" required error={errors.roleCode} hint="例如：SERVICE_DESK">
          <Input
            value={roleCode}
            placeholder="大写字母与下划线"
            invalid={!!errors.roleCode}
            onChange={(event) => setRoleCode(event.target.value)}
          />
        </Field>
        <Field label="角色名称" required error={errors.roleName}>
          <Input
            value={roleName}
            placeholder="例如：服务台人员"
            invalid={!!errors.roleName}
            onChange={(event) => setRoleName(event.target.value)}
          />
        </Field>
        <Field label="角色说明">
          <Textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
