function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayString(): string {
  return toDateString(new Date())
}

/** n 天前的 yyyy-MM-dd，n=0 表示今天 */
export function daysAgoString(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toDateString(date)
}
