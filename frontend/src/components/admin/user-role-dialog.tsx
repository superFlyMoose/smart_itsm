import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRoles } from '@/hooks/use-meta'
import type { RoleRecord, UserRecord } from '@/types/organization'

interface UserRoleDialogProps {
  open: boolean
  user: UserRecord | null
  loading?: boolean
  onClose: () => void
  onSubmit: (roleIds: number[]) => void
}

export function UserRoleDialog({ open, user, loading = false, onClose, onSubmit }: UserRoleDialogProps) {
  const { data: roles, isLoading } = useRoles(open)
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    if (open && user && roles) {
      setSelected(
        roles.filter((role: RoleRecord) => user.roles.includes(role.roleCode)).map((role) => role.id),
      )
    }
  }, [open, user, roles])

  const toggle = (roleId: number) => {
    setSelected((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`分配角色 - ${user?.realName ?? ''}`}
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button loading={loading} onClick={() => onSubmit(selected)}>
            保存
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {roles?.map((role) => (
            <li key={role.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle px-3.5 py-2.5 transition-colors hover:bg-surface-alt has-[:checked]:border-brand has-[:checked]:bg-brand-soft/50">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[var(--brand)]"
                  checked={selected.includes(role.id)}
                  onChange={() => toggle(role.id)}
                />
                <span>
                  <span className="block text-[13px] font-medium text-strong">
                    {role.roleName}
                    <span className="tnum ml-2 text-xs font-normal text-faint">{role.roleCode}</span>
                  </span>
                  {role.description && (
                    <span className="mt-0.5 block text-xs text-faint">{role.description}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
