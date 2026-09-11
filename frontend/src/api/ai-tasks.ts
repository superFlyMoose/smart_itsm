import { http } from '@/lib/http/request'
import type {
  AiTask,
  AiTaskCreateRequest,
  AiTaskCreateResult,
} from '@/types/ai'

export const aiTaskApi = {
  create: (data: AiTaskCreateRequest) =>
    http.post<AiTaskCreateResult>('/ai/tasks', data),
  detail: (taskId: number) => http.get<AiTask>(`/ai/tasks/${taskId}`),
}
