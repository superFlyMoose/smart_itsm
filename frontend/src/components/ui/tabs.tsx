interface TabItem {
  key: string
  label: string
  count?: number
}

interface TabsProps {
  items: TabItem[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ items, active, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto rounded-lg bg-surface-alt p-1 ${className}`}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.key}
          role="tab"
          aria-selected={active === item.key}
          onClick={() => onChange(item.key)}
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
            active === item.key
              ? 'bg-surface text-strong shadow-sm'
              : 'text-muted hover:text-strong'
          }`}
        >
          {item.label}
          {item.count != null && (
            <span
              className={`tnum rounded-full px-1.5 text-xs ${
                active === item.key ? 'bg-brand-soft text-brand-700' : 'bg-surface text-faint'
              }`}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
