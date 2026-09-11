import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import type { FlatOption } from '@/lib/tree'
import type { UserAdminUpdateRequest, UserCreateRequest, UserRecord } from '@/types/organization'

export type UserFormPayload = UserCreateRequest | UserAdminUpdateRequest

interface UserFormModalProps {
  open: boolean
  user: UserRecord | null
  departmentOptions: FlatOption[]
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: UserFormPayload) => void
}

interface FormState {
  username: string
  password: string
  employeeNo: string
  realName: string
  departmentId: string
  position: string
  phone: string
  email: string
}

const emptyForm: FormState = {
  username: '',
  password: '',
  employeeNo: '',
  realName: '',
  departmentId: '',
  position: '',
  phone: '',
  email: '',
}

export function UserFormModal({
  open,
  user,
  departmentOptions,
  loading = false,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        user
          ? {
              username: user.username,
              password: '',
              employeeNo: user.employeeNo,
              realName: user.realName,
              departmentId: user.departmentId ? String(user.departmentId) : '',
              position: user.position ?? '',
              phone: user.phone ?? '',
              email: user.email ?? '',
            }
          : emptyForm,
      )
      setErrors({})
    }
  }, [open, user])

  const set = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!user && !form.username.trim()) next.username = '请输入用户名'
    if (!user && !form.password) next.password = '请输入初始密码'
    else if (!user && form.password.length < 6) next.password = '密码至少 6 位'
    if (!form.employeeNo.trim()) next.employeeNo = '请输入工号'
    if (!form.realName.trim()) next.realName = '请输入姓名'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const base = {
      realName: form.realName.trim(),
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      position: form.position.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    }
    onSubmit(
      user
        ? base
        : {
            ...base,
            username: form.username.trim(),
            password: form.password,
            employeeNo: form.employeeNo.trim(),
          },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? '编辑用户' : '新建用户'}
      width="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            保存
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!user && (
          <Field label="用户名" required error={errors.username}>
            <Input value={form.username} invalid={!!errors.username} onChange={set('username')} placeholder="登录账号" />
          </Field>
        )}
        {!user && (
          <Field label="初始密码" required error={errors.password}>
            <Input
              type="password"
              value={form.password}
              invalid={!!errors.password}
              onChange={set('password')}
              placeholder="至少 6 位"
            />
          </Field>
        )}
        <Field label="工号" required error={errors.employeeNo}>
          <Input value={form.employeeNo} invalid={!!errors.employeeNo} onChange={set('employeeNo')} />
        </Field>
        <Field label="姓名" required error={errors.realName}>
          <Input value={form.realName} invalid={!!errors.realName} onChange={set('realName')} />
        </Field>
        <Field label="所属部门">
          <Select value={form.departmentId} onChange={set('departmentId')}>
            <option value="">未分配部门</option>
            {departmentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {'　'.repeat(option.depth)}
                {option.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="职位">
          <Input value={form.position} onChange={set('position')} />
        </Field>
        <Field label="手机号">
          <Input value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="邮箱">
          <Input type="email" value={form.email} onChange={set('email')} />
        </Field>
      </div>
    </Modal>
  )
}
