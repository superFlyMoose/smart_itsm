import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { PRIORITY_OPTIONS } from '@/lib/constants'
import { flattenTree } from '@/lib/tree'
import { toast } from '@/lib/stores/toast'
import { ticketApi } from '@/api/tickets'
import { useCategoryTree, useTeams } from '@/hooks/use-meta'
import { ApiError } from '@/lib/http/request'
import type { TicketPriority } from '@/types/ticket'

interface FormState {
  title: string
  description: string
  categoryId: string
  priority: TicketPriority
  teamId: string
}

const initialForm: FormState = {
  title: '',
  description: '',
  categoryId: '',
  priority: 'MEDIUM',
  teamId: '',
}

export function TicketCreatePage() {
  const navigate = useNavigate()
  const categoryTree = useCategoryTree()
  const teams = useTeams()
  const categoryOptions = flattenTree(categoryTree.data)

  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) next.title = '请输入工单标题'
    else if (form.title.trim().length < 4) next.title = '标题至少 4 个字符'
    if (!form.description.trim()) next.description = '请描述遇到的问题或诉求'
    if (!form.categoryId) next.categoryId = '请选择问题分类'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const result = await ticketApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        priority: form.priority,
        teamId: form.teamId ? Number(form.teamId) : null,
      })
      toast.success(`工单 ${result.ticketNo} 创建成功`)
      navigate(`/tickets/${result.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '创建失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/tickets"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-brand"
      >
        <ArrowLeft size={14} />
        返回全部工单
      </Link>
      <PageHeader title="新建工单" description="清晰的标题与描述有助于工程师更快定位问题" />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="工单标题" required error={errors.title}>
              <Input
                value={form.title}
                maxLength={100}
                placeholder="简要概括问题，例如：无法连接公司 VPN"
                invalid={!!errors.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="问题分类" required error={errors.categoryId}>
                <Select
                  value={form.categoryId}
                  invalid={!!errors.categoryId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                >
                  <option value="">请选择分类</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {'　'.repeat(option.depth)}
                      {option.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="优先级" required>
                <Select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priority: event.target.value as TicketPriority }))
                  }
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="期望处理团队"
              hint="可指定处理团队，也可留空由服务台分配"
            >
              <Select
                value={form.teamId}
                onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value }))}
              >
                <option value="">不指定，由服务台分配</option>
                {teams.data?.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}（{team.departmentName}）
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="问题描述" required error={errors.description}>
              <Textarea
                rows={8}
                value={form.description}
                placeholder="请说明：问题现象、发生时间、影响范围、已尝试的处理方式等"
                invalid={!!errors.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
              <Link to="/tickets">
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                提交工单
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
