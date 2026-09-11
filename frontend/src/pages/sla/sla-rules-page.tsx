import { useEffect, useState } from 'react'
import { PencilSimple, PlusCircle, Prohibit, ShieldCheck } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Table, THead, TBody, TH, TD, TR } from '@/components/ui/table'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { ForbiddenState } from '@/components/ui/forbidden-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PRIORITY_META, PRIORITY_OPTIONS } from '@/lib/constants'
import { isForbiddenError } from '@/lib/http/request'
import { formatMinutes } from '@/lib/format'
import { toast } from '@/lib/stores/toast'
import { useAuthStore } from '@/lib/stores/auth'
import { useSlaRules, useSlaRuleMutations } from '@/hooks/use-sla'
import { ApiError } from '@/lib/http/request'
import type { SlaRule } from '@/types/sla'
import type { TicketPriority } from '@/types/ticket'

interface FormState {
  name: string
  priority: TicketPriority
  responseMinutes: string
  resolveMinutes: string
  escalationMinutes: string
}

const emptyForm: FormState = {
  name: '',
  priority: 'MEDIUM',
  responseMinutes: '',
  resolveMinutes: '',
  escalationMinutes: '',
}

export function SlaRulesPage() {
  const canManage = useAuthStore((state) => state.hasPermission('sla:manage'))
  const { data, isLoading, error, refetch } = useSlaRules()
  const mutations = useSlaRuleMutations()

  const [editing, setEditing] = useState<SlaRule | null>(null)
  const [creating, setCreating] = useState(false)
  const [disabling, setDisabling] = useState<SlaRule | null>(null)

  const handleSave = async (form: FormState) => {
    try {
      await mutations.save.mutateAsync({
        id: editing?.id ?? null,
        data: {
          name: form.name.trim(),
          priority: form.priority,
          responseMinutes: Number(form.responseMinutes),
          resolveMinutes: Number(form.resolveMinutes),
          escalationMinutes: form.escalationMinutes ? Number(form.escalationMinutes) : null,
        },
      })
      toast.success(editing ? '规则已更新' : '规则已创建')
      setEditing(null)
      setCreating(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '保存失败')
    }
  }

  return (
    <div>
      <PageHeader
        title="SLA 规则"
        description="按工单优先级定义首次响应、解决与升级时限"
        actions={
          canManage && (
            <Button icon={<PlusCircle size={16} />} onClick={() => setCreating(true)}>
              新建规则
            </Button>
          )
        }
      />

      <Card>
        {error ? (
          isForbiddenError(error) ? (
            <ForbiddenState />
          ) : (
            <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
          )
        ) : isLoading ? (
          <TableSkeleton columns={7} />
        ) : data && data.length > 0 ? (
          <Table>
            <THead>
              <tr>
                <TH>规则名称</TH>
                <TH>适用优先级</TH>
                <TH>首次响应时限</TH>
                <TH>解决时限</TH>
                <TH>升级时限</TH>
                <TH>状态</TH>
                {canManage && <TH>操作</TH>}
              </tr>
            </THead>
            <TBody>
              {data.map((rule) => (
                <TR key={rule.id}>
                  <TD className="font-medium text-strong">{rule.name}</TD>
                  <TD>
                    <Badge tone={PRIORITY_META[rule.priority].tone}>
                      {PRIORITY_META[rule.priority].label}
                    </Badge>
                  </TD>
                  <TD className="tnum text-muted">{formatMinutes(rule.responseMinutes)}</TD>
                  <TD className="tnum text-muted">{formatMinutes(rule.resolveMinutes)}</TD>
                  <TD className="tnum text-muted">{formatMinutes(rule.escalationMinutes)}</TD>
                  <TD>
                    <Badge tone={rule.status === 1 ? 'success' : 'neutral'}>
                      {rule.status === 1 ? '启用中' : '已禁用'}
                    </Badge>
                  </TD>
                  {canManage && (
                    <TD>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" icon={<PencilSimple size={15} />} onClick={() => setEditing(rule)}>
                          编辑
                        </Button>
                        {rule.status === 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-danger-soft"
                            icon={<Prohibit size={15} />}
                            onClick={() => setDisabling(rule)}
                          >
                            禁用
                          </Button>
                        )}
                      </div>
                    </TD>
                  )}
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            icon={<ShieldCheck size={24} />}
            title="暂无 SLA 规则"
            description={canManage ? '新建规则以启用 SLA 时限管理' : '请联系管理员配置 SLA 规则'}
          />
        )}
      </Card>

      <RuleFormModal
        open={creating || !!editing}
        rule={editing}
        saving={mutations.save.isPending}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={!!disabling}
        title="禁用 SLA 规则"
        danger
        description={`确认禁用规则「${disabling?.name ?? ''}」？禁用后新工单不再按此规则计时`}
        confirmText="确认禁用"
        loading={mutations.disable.isPending}
        onClose={() => setDisabling(null)}
        onConfirm={async () => {
          if (!disabling) return
          try {
            await mutations.disable.mutateAsync(disabling.id)
            toast.success('规则已禁用')
            setDisabling(null)
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : '操作失败')
          }
        }}
      />
    </div>
  )
}

function RuleFormModal({
  open,
  rule,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean
  rule: SlaRule | null
  saving: boolean
  onClose: () => void
  onSubmit: (form: FormState) => void
}) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        rule
          ? {
              name: rule.name,
              priority: rule.priority,
              responseMinutes: String(rule.responseMinutes),
              resolveMinutes: String(rule.resolveMinutes),
              escalationMinutes:
                rule.escalationMinutes == null ? '' : String(rule.escalationMinutes),
            }
          : emptyForm,
      )
      setErrors({})
    }
  }, [open, rule])

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = '请输入规则名称'
    const response = Number(form.responseMinutes)
    const resolve = Number(form.resolveMinutes)
    if (!form.responseMinutes || response <= 0) next.responseMinutes = '请输入正整数'
    if (!form.resolveMinutes || resolve <= 0) next.resolveMinutes = '请输入正整数'
    if (form.escalationMinutes && Number(form.escalationMinutes) <= 0) {
      next.escalationMinutes = '请输入正整数'
    }
    if (resolve > 0 && response > 0 && resolve < response) {
      next.resolveMinutes = '解决时限应大于响应时限'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rule ? '编辑 SLA 规则' : '新建 SLA 规则'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={saving}
            onClick={() => {
              if (validate()) onSubmit(form)
            }}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="规则名称" required error={errors.name}>
          <Input
            value={form.name}
            placeholder="例如：紧急工单 SLA"
            invalid={!!errors.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </Field>
        <Field label="适用优先级" required>
          <Select
            value={form.priority}
            disabled={!!rule}
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
        <div className="grid grid-cols-3 gap-3">
          <Field label="响应时限（分钟）" required error={errors.responseMinutes}>
            <Input
              type="number"
              min={1}
              value={form.responseMinutes}
              invalid={!!errors.responseMinutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, responseMinutes: event.target.value }))
              }
            />
          </Field>
          <Field label="解决时限（分钟）" required error={errors.resolveMinutes}>
            <Input
              type="number"
              min={1}
              value={form.resolveMinutes}
              invalid={!!errors.resolveMinutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, resolveMinutes: event.target.value }))
              }
            />
          </Field>
          <Field label="升级时限（分钟）" error={errors.escalationMinutes} hint="留空表示不升级">
            <Input
              type="number"
              min={1}
              value={form.escalationMinutes}
              invalid={!!errors.escalationMinutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, escalationMinutes: event.target.value }))
              }
            />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
