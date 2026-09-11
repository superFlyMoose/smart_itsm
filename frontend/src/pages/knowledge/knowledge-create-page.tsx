import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { flattenTree } from '@/lib/tree'
import { toast } from '@/lib/stores/toast'
import { useCategoryTree } from '@/hooks/use-meta'
import { useKnowledgeMutations } from '@/hooks/use-knowledge'
import { ApiError } from '@/lib/http/request'

export function KnowledgeCreatePage() {
  const navigate = useNavigate()
  const categoryTree = useCategoryTree()
  const categoryOptions = flattenTree(categoryTree.data)
  const mutations = useKnowledgeMutations()

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError('请输入文档标题')
      return
    }
    try {
      const id = await mutations.create.mutateAsync({
        title: title.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        fileUrl: fileUrl.trim() || undefined,
      })
      toast.success('文档已创建为草稿')
      navigate(`/knowledge/${id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '创建失败')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/knowledge"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-brand"
      >
        <ArrowLeft size={14} />
        返回知识库
      </Link>
      <PageHeader title="新建知识文档" description="文档创建后为草稿状态，发布后对全员可见" />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="文档标题" required error={titleError}>
              <Input
                value={title}
                maxLength={100}
                placeholder="例如：VPN 无法连接排查手册"
                invalid={!!titleError}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (titleError) setTitleError(null)
                }}
              />
            </Field>
            <Field label="所属分类">
              <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">未分类</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {'　'.repeat(option.depth)}
                    {option.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="文件链接"
              hint="填写文档或附件的访问地址，用户可在详情页直接打开"
            >
              <Input
                value={fileUrl}
                placeholder="https://..."
                onChange={(event) => setFileUrl(event.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
              <Link to="/knowledge">
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
              <Button type="submit" loading={mutations.create.isPending}>
                创建草稿
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
