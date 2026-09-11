import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, MagnifyingGlass, PlusCircle, X } from '@phosphor-icons/react'
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
import {
  KNOWLEDGE_STATUS_META,
  KNOWLEDGE_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '@/lib/constants'
import { flattenTree } from '@/lib/tree'
import { formatDateTime } from '@/lib/format'
import { useAuthStore } from '@/lib/stores/auth'
import { useCategoryTree } from '@/hooks/use-meta'
import { useKnowledgeList } from '@/hooks/use-knowledge'
import type { KnowledgeQuery, KnowledgeStatus } from '@/types/knowledge'

interface FilterForm {
  title: string
  status: KnowledgeStatus | ''
  categoryId: string
}

export function KnowledgeListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canManage = user?.roles.includes('ADMIN') || hasPermission('system:manage')

  const categoryTree = useCategoryTree()
  const categoryOptions = flattenTree(categoryTree.data)

  const [form, setForm] = useState<FilterForm>({ title: '', status: '', categoryId: '' })
  const [query, setQuery] = useState<KnowledgeQuery>({ pageNum: 1, pageSize: 10 })
  const { data, isLoading, error, refetch, isFetching } = useKnowledgeList(query)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize,
      title: form.title.trim() || undefined,
      status: canManage ? form.status || undefined : undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    })
  }

  const handleReset = () => {
    setForm({ title: '', status: '', categoryId: '' })
    setQuery({ pageNum: 1, pageSize: query.pageSize })
  }

  return (
    <div>
      <PageHeader
        title="知识库"
        description="常见问题、操作手册与解决方案沉淀"
        actions={
          canManage && (
            <Link to="/knowledge/new">
              <Button icon={<PlusCircle size={16} />}>新建文档</Button>
            </Link>
          )
        }
      />

      <Card className="mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex w-64 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">标题关键词</label>
            <Input
              value={form.title}
              placeholder="输入文档标题"
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="flex w-44 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-strong">分类</label>
            <Select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">全部分类</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {'　'.repeat(option.depth)}
                  {option.name}
                </option>
              ))}
            </Select>
          </div>
          {canManage && (
            <div className="flex w-36 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-strong">状态</label>
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as KnowledgeStatus | '' }))
                }
              >
                <option value="">全部状态</option>
                {KNOWLEDGE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" icon={<MagnifyingGlass size={16} />} loading={isFetching}>
              查询
            </Button>
            {(form.title || form.status || form.categoryId) && (
              <Button type="button" variant="outline" icon={<X size={15} />} onClick={handleReset}>
                重置
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton columns={6} />
        ) : data && data.records.length > 0 ? (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>文档标题</TH>
                  <TH>分类</TH>
                  <TH>上传人</TH>
                  {canManage && <TH>状态</TH>}
                  <TH>更新时间</TH>
                  <TH>操作</TH>
                </tr>
              </THead>
              <TBody>
                {data.records.map((doc) => (
                  <TR key={doc.id}>
                    <TD className="max-w-[320px]">
                      <span className="flex items-center gap-2 font-medium text-strong">
                        <BookOpen size={16} className="shrink-0 text-brand" />
                        <span className="line-clamp-1">{doc.title}</span>
                      </span>
                    </TD>
                    <TD className="text-muted">{doc.categoryName ?? '-'}</TD>
                    <TD className="text-muted">{doc.uploaderName}</TD>
                    {canManage && (
                      <TD>
                        <Badge tone={KNOWLEDGE_STATUS_META[doc.status].tone}>
                          {KNOWLEDGE_STATUS_META[doc.status].label}
                        </Badge>
                      </TD>
                    )}
                    <TD className="tnum whitespace-nowrap text-muted">
                      {formatDateTime(doc.updatedAt)}
                    </TD>
                    <TD>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/knowledge/${doc.id}`)}
                      >
                        查看
                      </Button>
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
          <EmptyState
            icon={<BookOpen size={24} />}
            title="暂无知识文档"
            description={canManage ? '可新建文档并在完善内容后发布' : '已发布的知识文档将展示在这里'}
          />
        )}
      </Card>
    </div>
  )
}
