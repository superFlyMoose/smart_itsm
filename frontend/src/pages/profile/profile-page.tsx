import { useEffect, useState } from 'react'
import { Key, UserCircle } from '@phosphor-icons/react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ROLE_META } from '@/lib/constants'
import { toast } from '@/lib/stores/toast'
import { useChangePassword, useMyProfile, useUpdateProfile } from '@/hooks/use-profile'
import { ApiError } from '@/lib/http/request'

export function ProfilePage() {
  const { data: profile, isLoading, error, refetch } = useMyProfile()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <Card>
        <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="个人中心" description="维护个人资料与登录密码" />

      <Card className="mb-4">
        <CardHeader
          title={
            <span className="flex items-center gap-3">
              <Avatar name={profile.realName} />
              {profile.realName}
            </span>
          }
          description={`@${profile.username} · 工号 ${profile.employeeNo}`}
        />
        <CardBody className="flex flex-wrap gap-2">
          {profile.roles.map((role) => (
            <Badge key={role} tone="brand">
              {ROLE_META[role] ?? role}
            </Badge>
          ))}
        </CardBody>
      </Card>

      <ProfileForm
        key={profile.id}
        initial={{
          realName: profile.realName,
          position: profile.position ?? '',
          phone: profile.phone ?? '',
          email: profile.email ?? '',
        }}
      />

      <PasswordForm />

      <p className="mt-4 text-center text-xs text-faint">
        <UserCircle size={13} className="mr-1 inline" />
        部门、角色等信息由系统管理员维护
        <Key size={13} className="ml-3 mr-1 inline" />
        修改密码后需重新登录的场景以系统策略为准
      </p>
    </div>
  )
}

function ProfileForm({
  initial,
}: {
  initial: { realName: string; position: string; phone: string; email: string }
}) {
  const updateProfile = useUpdateProfile()
  const [form, setForm] = useState(initial)

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync({
        realName: form.realName.trim(),
        position: form.position.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      })
      toast.success('资料已更新')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '更新失败')
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader title="基本资料" />
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="姓名" required>
          <Input
            value={form.realName}
            onChange={(event) => setForm((prev) => ({ ...prev, realName: event.target.value }))}
          />
        </Field>
        <Field label="职位">
          <Input
            value={form.position}
            placeholder="例如：运维工程师"
            onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
          />
        </Field>
        <Field label="手机号">
          <Input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </Field>
        <Field label="邮箱">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </Field>
        <div className="sm:col-span-2 flex justify-end">
          <Button loading={updateProfile.isPending} onClick={handleSubmit}>
            保存资料
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function PasswordForm() {
  const changePassword = useChangePassword()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldPassword, newPassword, confirmPassword])

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword) {
      setError('请填写完整密码信息')
      return
    }
    if (newPassword.length < 6) {
      setError('新密码至少 6 位')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    try {
      await changePassword.mutateAsync({ oldPassword, newPassword })
      toast.success('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '修改失败')
    }
  }

  return (
    <Card>
      <CardHeader title="修改密码" />
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="当前密码" required>
          <Input
            type="password"
            value={oldPassword}
            autoComplete="current-password"
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </Field>
        <div className="hidden sm:block" />
        <Field label="新密码" required>
          <Input
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </Field>
        <Field label="确认新密码" required>
          <Input
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </Field>
        {error && <p className="text-xs text-danger sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2 flex justify-end">
          <Button loading={changePassword.isPending} onClick={handleSubmit}>
            修改密码
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
