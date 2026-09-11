import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/http/request'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 业务/鉴权错误不重试，仅对网络抖动重试一次
        if (error instanceof ApiError && error.code !== 'NETWORK_ERROR') return false
        return failureCount < 1
      },
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
