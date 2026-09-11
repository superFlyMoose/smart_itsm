import { useEffect, useState } from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { Field } from './field'
import { Textarea } from './textarea'
import { Input } from './input'

interface PromptDialogProps {
  open: boolean
  title: string
  description?: string
  label: string
  required?: boolean
  placeholder?: string
  initialValue?: string
  multiline?: boolean
  rows?: number
  confirmText?: string
  danger?: boolean
  /** 提交中状态（通常由 mutation.isPending 传入） */
  loading?: boolean
  onSubmit: (value: string) => void
  onClose: () => void
}

/** 单一文本输入弹窗，覆盖催办/取消/拒绝/升级/处理/解决等动作 */
export function PromptDialog({
  open,
  title,
  description,
  label,
  required = true,
  placeholder,
  initialValue = '',
  multiline = true,
  rows = 4,
  confirmText = '提交',
  danger = false,
  loading = false,
  onSubmit,
  onClose,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValue(initialValue)
      setError(null)
    }
  }, [open, initialValue])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (required && !trimmed) {
      setError('该内容不能为空')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onClick={handleSubmit}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <Field label={label} required={required} error={error}>
        {multiline ? (
          <Textarea
            rows={rows}
            value={value}
            placeholder={placeholder}
            invalid={!!error}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError(null)
            }}
          />
        ) : (
          <Input
            value={value}
            placeholder={placeholder}
            invalid={!!error}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError(null)
            }}
          />
        )}
      </Field>
    </Modal>
  )
}
