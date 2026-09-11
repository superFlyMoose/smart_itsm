import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface PaginationProps {
  pageNum: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  pageNum,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (pageNum - 1) * pageSize + 1
  const end = Math.min(pageNum * pageSize, total)

  const pageNumbers = buildPageNumbers(pageNum, pages)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle px-4 py-3 sm:flex-row">
      <p className="text-[13px] text-muted">
        第 <span className="tnum">{start}</span> - <span className="tnum">{end}</span> 条，共{' '}
        <span className="tnum">{total}</span> 条
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange && pageSizeOptions && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-border-subtle bg-surface px-2 text-[13px] text-muted focus:outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pageNum <= 1}
            onClick={() => onPageChange(pageNum - 1)}
            className="flex size-8 items-center justify-center rounded-md border border-border-subtle text-muted transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
            aria-label="上一页"
          >
            <CaretLeft size={15} weight="bold" />
          </button>
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-faint">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`tnum flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] transition-colors ${
                  page === pageNum
                    ? 'border-brand bg-brand text-brand-contrast'
                    : 'border-border-subtle text-muted hover:bg-surface-alt'
                }`}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={pageNum >= pages}
            onClick={() => onPageChange(pageNum + 1)}
            className="flex size-8 items-center justify-center rounded-md border border-border-subtle text-muted transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
            aria-label="下一页"
          >
            <CaretRight size={15} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  if (left > 2) pages.push('...')
  for (let p = left; p <= right; p += 1) pages.push(p)
  if (right < total - 1) pages.push('...')
  pages.push(total)
  return pages
}
