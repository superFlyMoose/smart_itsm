export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />
}

/** 与最终表格形状一致的骨架屏 */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-border-subtle">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: columns }).map((__, col) => (
            <Skeleton
              key={col}
              className={`h-4 ${col === 0 ? 'w-1/4' : 'flex-1'} ${col === columns - 1 ? 'w-16 flex-none' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
