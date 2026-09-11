import { useEffect, useMemo, useState } from 'react'
import {
  CaretDown,
  CaretRight,
  PencilSimple,
  PlusCircle,
  Prohibit,
  Tag,
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
import { Textarea } from '@/components/ui/textarea'
import { useCategoryTree } from '@/hooks/use-meta'
import { useOrganizationMutations } from '@/hooks/use-organization'
import { toast } from '@/lib/stores/toast'
import { ApiError } from '@/lib/http/request'
import type { CategoryTreeNode } from '@/types/organization'

interface FlatCategory extends CategoryTreeNode {
  depth: number
}

function flatten(nodes: CategoryTreeNode[] | undefined, depth = 0, acc: FlatCategory[] = []): FlatCategory[] {
  nodes?.forEach((node) => {
    acc.push({ ...node, depth })
    flatten(node.children, depth + 1, acc)
  })
  return acc
}

export function CategoryManagePage() {
  const { data: tree, isLoading, error, refetch } = useCategoryTree()
  const mutations = useOrganizationMutations()
  const rows = useMemo(() => flatten(tree), [tree])

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [editing, setEditing] = useState<CategoryTreeNode | null>(null)
  const [creating, setCreating] = useState(false)
  const [disabling, setDisabling] = useState<CategoryTreeNode | null>(null)

  const hiddenIds = useMemo(() => {
    const hidden = new Set<number>()
    const walk = (nodes: CategoryTreeNode[] | undefined, ancestorHidden: boolean) => {
      nodes?.forEach((node) => {
        const selfHidden = ancestorHidden
        if (selfHidden) hidden.add(node.id)
        walk(node.children, selfHidden || collapsed.has(node.id))
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

  return (
    <div>
      <PageHeader
        title="分类管理"
        description="维护工单问题分类的层级结构"
        actions={
          <Button icon={<PlusCircle size={16} />} onClick={() => setCreating(true)}>
            新建分类
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
                <TH className="w-2/5">分类名称</TH>
                <TH>说明</TH>
                <TH>下级分类数</TH>
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
                        <Tag size={15} className="text-brand" />
                        <span className="font-medium text-strong">{row.name}</span>
                      </span>
                    </TD>
                    <TD className="max-w-[320px] text-muted">
                      <span className="line-clamp-1">{row.description ?? '-'}</span>
                    </TD>
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
          <EmptyState icon={<Tag size={24} />} title="暂无分类" description="新建顶级分类以支撑工单归类" />
        )}
      </Card>

      <CategoryFormModal
        open={creating || !!editing}
        category={editing}
        categories={rows}
        loading={mutations.saveCategory.isPending}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={async (data) => {
          try {
            await mutations.saveCategory.mutateAsync({ id: editing?.id ?? null, data })
            toast.success(editing ? '分类已更新' : '分类已创建')
            setCreating(false)
            setEditing(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '保存失败')
          }
        }}
      />

      <ConfirmDialog
        open={!!disabling}
        title="禁用分类"
        danger
        description={`确认禁用分类「${disabling?.name ?? ''}」？禁用后新工单将无法选择该分类`}
        confirmText="确认禁用"
        loading={mutations.disableCategory.isPending}
        onClose={() => setDisabling(null)}
        onConfirm={async () => {
          if (!disabling) return
          try {
            await mutations.disableCategory.mutateAsync(disabling.id)
            toast.success('分类已禁用')
            setDisabling(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '操作失败')
          }
        }}
      />
    </div>
  )
}

function CategoryFormModal({
  open,
  category,
  categories,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean
  category: CategoryTreeNode | null
  categories: FlatCategory[]
  loading: boolean
  onClose: () => void
  onSubmit: (data: { name: string; parentId: number | null; description?: string }) => void
}) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setParentId(category?.parentId ? String(category.parentId) : '')
      setDescription(category?.description ?? '')
      setNameError(null)
    }
  }, [open, category])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? '编辑分类' : '新建分类'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              if (!name.trim()) {
                setNameError('请输入分类名称')
                return
              }
              onSubmit({
                name: name.trim(),
                parentId: parentId ? Number(parentId) : null,
                description: description.trim() || undefined,
              })
            }}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="分类名称" required error={nameError}>
          <Input value={name} invalid={!!nameError} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="上级分类">
          <Select value={parentId} onChange={(event) => setParentId(event.target.value)}>
            <option value="">作为顶级分类</option>
            {categories
              .filter((item) => item.id !== category?.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {'　'.repeat(item.depth)}
                  {item.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="分类说明">
          <Textarea
            rows={3}
            value={description}
            placeholder="说明该分类适用的问题范围（可选）"
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
