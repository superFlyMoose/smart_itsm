export interface NotificationRecord {
  id: number
  type: string
  title: string
  content: string
  relatedType: string | null
  relatedId: number | null
  isRead: boolean
  createdAt: string
}

export interface NotificationQuery {
  isRead?: boolean
  pageNum?: number
  pageSize?: number
}
