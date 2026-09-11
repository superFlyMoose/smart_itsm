import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { notificationApi } from '@/api/notifications'
import { queryKeys } from './query-keys'
import type { NotificationQuery } from '@/types/notification'

export function useNotifications(query: NotificationQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationApi.page(query),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: notificationApi.unreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useNotificationMutations() {
  const qc = useQueryClient()
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['notifications'] })

  const markRead = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: invalidate,
  })

  const readAll = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: invalidate,
  })

  return { markRead, readAll }
}
