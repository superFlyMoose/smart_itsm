/** 展示后端 yyyy-MM-dd HH:mm:ss 时间字符串，原样返回即可；此处兜底空值 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  return value
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return value.slice(0, 10)
}

/** 文件大小人类可读格式 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return '-'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/** 将分钟数转为「x小时x分钟」可读形式 */
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null) return '-'
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} 小时` : `${hours} 小时 ${rest} 分钟`
}

/**
 * 附件访问地址。
 * 开发环境经 Vite 代理转发到 8080；返回完整地址时原样使用。
 */
export function resolveFileUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  return url.startsWith('/') ? url : `/${url}`
}

export function initialsOf(name: string): string {
  if (!name) return '?'
  const trimmed = name.trim()
  // 中文名取后两个字，英文名取首字母
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return trimmed.slice(-2)
  }
  return trimmed.slice(0, 2).toUpperCase()
}

/** 依据字符串生成稳定的头像底色 */
export function avatarColor(seed: string): string {
  const palette = [
    'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
    'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200',
    'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0'
  return value.toLocaleString('zh-CN')
}
