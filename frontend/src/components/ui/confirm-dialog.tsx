import { useEffect, useState } from 'react'
import { Modal } from './modal'
import { Button } from './button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      {description && <p className="text-[13px] leading-6 text-muted">{description}</p>}
    </Modal>
  )
}

/** 简易受控开关 hook，配合确认框使用 */
export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  useEffect(() => () => setOpen(false), [])
  return { open, show: () => setOpen(true), hide: () => setOpen(false) }
}
