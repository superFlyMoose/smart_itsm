import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiTaskApi } from '@/api/ai-tasks'
import { queryKeys } from './query-keys'
import type { AiTaskCreateRequest } from '@/types/ai'

export function useAiTask(taskId: number | null, poll: boolean) {
  return useQuery({
    queryKey: queryKeys.aiTask(taskId ?? 0),
    queryFn: () => aiTaskApi.detail(taskId as number),
    enabled: taskId != null,
    refetchInterval: poll ? 2000 : false,
  })
}

export function useCreateAiTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AiTaskCreateRequest) => aiTaskApi.create(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.aiTask(result.id) })
    },
  })
}
