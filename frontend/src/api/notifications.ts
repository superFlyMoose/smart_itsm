import { http } from '@/lib/http/request'
import type { PageResult } from '@/types/common'
import type { NotificationQuery, NotificationRecord } from '@/types/notification'

interface UnreadCount {
  count: number
}

export const notificationApi = {
  page: (query: NotificationQuery) =>
    http.get<PageResult<NotificationRecord>>('/notifications', query),
  unreadCount: () => http.get<UnreadCount>('/notifications/unread-count'),
  markRead: (notificationId: number) =>
    http.post<void>(`/notifications/${notificationId}/read`),
  readAll: () => http.post<void>('/notifications/read-all'),
}
