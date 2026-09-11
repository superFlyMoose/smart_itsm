import type { ReactNode } from 'react'
import { CheckCircle, WarningCircle, Info, X } from '@phosphor-icons/react'
import { useToastStore, type ToastTone } from '@/lib/stores/toast'

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-success" />,
  error: <WarningCircle size={18} weight="fill" className="text-danger" />,
  info: <Info size={18} weight="fill" className="text-brand" />,
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface px-3.5 py-3 shadow-lg"
          role="alert"
        >
          <span className="mt-0.5">{toneIcon[item.tone]}</span>
          <p className="flex-1 text-[13px] leading-5 text-strong">{item.message}</p>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            className="text-faint transition-colors hover:text-strong"
            aria-label="关闭通知"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}
