import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DotsThreeVertical } from '@phosphor-icons/react'

interface DropdownItemProps {
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
  children: ReactNode
}

export function DropdownItem({ icon, danger, disabled, onSelect, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        danger
          ? 'text-danger hover:bg-danger-soft'
          : 'text-strong hover:bg-surface-alt'
      }`}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      {children}
    </button>
  )
}

interface DropdownProps {
  children: (close: () => void) => ReactNode
  trigger?: ReactNode
  align?: 'left' | 'right'
  label?: string
}

/** 行内操作菜单，点击外部或 Esc 关闭 */
export function Dropdown({ children, trigger, align = 'right', label = '更多操作' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-strong"
      >
        {trigger ?? <DotsThreeVertical size={17} weight="bold" />}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 min-w-44 rounded-lg border border-border-subtle bg-surface p-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
