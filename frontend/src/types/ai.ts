export type AiTaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'

export type AiTaskType =
  | 'TICKET_CLASSIFICATION'
  | 'TICKET_SOLUTION_SUGGESTION'
  | 'KNOWLEDGE_RETRIEVAL'
  | 'TICKET_SUMMARY'

export interface AiTaskCreateRequest {
  taskType: AiTaskType
  businessType: string
  businessId: number
}

export interface AiTaskCreateResult {
  id: number
  taskType: AiTaskType
  status: AiTaskStatus
}

export interface AiTask {
  id: number
  taskType: AiTaskType
  businessType: string
  businessId: number
  status: AiTaskStatus
  statusName: string
  output: string | null
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}
