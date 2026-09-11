import { useEffect, useMemo, useState } from 'react'
import {
  Buildings,
  CaretDown,
  CaretRight,
  PencilSimple,
  PlusCircle,
  Prohibit,
} from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { useDepartmentTree } from '@/hooks/use-meta'
import { useUsers } from '@/hooks/use-users'
import { useOrganizationMutations } from '@/hooks/use-organization'
import { toast } from '@/lib/stores/toast'
import { ApiError } from '@/lib/http/request'
import type { DepartmentTreeNode } from '@/types/organization'

interface FlatDepartment extends DepartmentTreeNode {
  depth: number
}

function flatten(nodes: DepartmentTreeNode[] | undefined, depth = 0, acc: FlatDepartment[] = []): FlatDepartment[] {
  nodes?.forEach((node) => {
    acc.push({ ...node, depth })
    flatten(node.children, depth + 1, acc)
  })
  return acc
}

export function DepartmentManagePage() {
  const { data: tree, isLoading, error, refetch } = useDepartmentTree()
  const { data: userPage } = useUsers({ pageNum: 1, pageSize: 100, status: 'ACTIVE' })
  const mutations = useOrganizationMutations()
  const rows = useMemo(() => flatten(tree), [tree])

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [editing, setEditing] = useState<DepartmentTreeNode | null>(null)
  const [creating, setCreating] = useState(false)
  const [disabling, setDisabling] = useState<DepartmentTreeNode | null>(null)

  const hiddenIds = useMemo(() => {
    const hidden = new Set<number>()
    const walk = (nodes: DepartmentTreeNode[] | undefined, ancestorCollapsed: boolean) => {
      nodes?.forEach((node) => {
        const selfHidden = ancestorCollapsed || collapsed.has(node.parentId ?? -1)
        if (selfHidden) hidden.add(node.id)
        walk(node.children, selfHidden)
      })
    }
    walk(tree, false)
    return hidden
  }, [tree, collapsed])

  const toggle = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const userName = (id: number | null) => userPage?.records.find((user) => user.id === id)?.realName

  return (
    <div>
      <PageHeader
        title="部门管理"
        description="维护组织部门层级与部门负责人"
        actions={
          <Button icon={<PlusCircle size={16} />} onClick={() => setCreating(true)}>
            新建部门
          </Button>
        }
      />

      <Card>
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={4} />
        ) : rows.length > 0 ? (
          <Table>
            <THead>
              <tr>
                <TH className="w-1/2">部门名称</TH>
                <TH>负责人</TH>
                <TH>下级部门数</TH>
                <TH>操作</TH>
              </tr>
            </THead>
            <TBody>
              {rows
                .filter((row) => !hiddenIds.has(row.id))
                .map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <span className="flex items-center gap-1.5" style={{ paddingLeft: row.depth * 20 }}>
                        {row.children.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggle(row.id)}
                            className="text-faint hover:text-strong"
                            aria-label="展开/折叠"
                          >
                            {collapsed.has(row.id) ? <CaretRight size={14} /> : <CaretDown size={14} />}
                          </button>
                        ) : (
                          <span className="inline-block w-[14px]" />
                        )}
                        <Buildings size={15} className="text-brand" />
                        <span className="font-medium text-strong">{row.name}</span>
                      </span>
                    </TD>
                    <TD className="text-muted">{userName(row.managerId) ?? '-'}</TD>
                    <TD className="tnum text-muted">{row.children.length}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" icon={<PencilSimple size={15} />} onClick={() => setEditing(row)}>
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger-soft"
                          icon={<Prohibit size={15} />}
                          onClick={() => setDisabling(row)}
                        >
                          禁用
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState icon={<Buildings size={24} />} title="暂无部门" description="新建顶级部门以搭建组织结构" />
        )}
      </Card>

      <DepartmentFormModal
        open={creating || !!editing}
        department={editing}
        departments={rows}
        managerOptions={userPage?.records ?? []}
        loading={mutations.saveDepartment.isPending}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={async (data) => {
          try {
            await mutations.saveDepartment.mutateAsync({ id: editing?.id ?? null, data })
            toast.success(editing ? '部门已更新' : '部门已创建')
            setCreating(false)
            setEditing(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '保存失败')
          }
        }}
      />

      <ConfirmDialog
        open={!!disabling}
        title="禁用部门"
        danger
        description={`确认禁用部门「${disabling?.name ?? ''}」？禁用后新建工单与用户将无法选择该部门`}
        confirmText="确认禁用"
        loading={mutations.disableDepartment.isPending}
        onClose={() => setDisabling(null)}
        onConfirm={async () => {
          if (!disabling) return
          try {
            await mutations.disableDepartment.mutateAsync(disabling.id)
            toast.success('部门已禁用')
            setDisabling(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '操作失败')
          }
        }}
      />
    </div>
  )
}

function DepartmentFormModal({
  open,
  department,
  departments,
  managerOptions,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean
  department: DepartmentTreeNode | null
  departments: FlatDepartment[]
  managerOptions: { id: number; realName: string }[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: { name: string; parentId: number | null; managerId: number | null }) => void
}) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(department?.name ?? '')
      setParentId(department?.parentId ? String(department.parentId) : '')
      setManagerId(department?.managerId ? String(department.managerId) : '')
      setNameError(null)
    }
  }, [open, department])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department ? '编辑部门' : '新建部门'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              if (!name.trim()) {
                setNameError('请输入部门名称')
                return
              }
              onSubmit({
                name: name.trim(),
                parentId: parentId ? Number(parentId) : null,
                managerId: managerId ? Number(managerId) : null,
              })
            }}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="部门名称" required error={nameError}>
          <Input value={name} invalid={!!nameError} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="上级部门">
          <Select value={parentId} onChange={(event) => setParentId(event.target.value)}>
            <option value="">作为顶级部门</option>
            {departments
              .filter((item) => item.id !== department?.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {'　'.repeat(item.depth)}
                  {item.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="部门负责人">
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
