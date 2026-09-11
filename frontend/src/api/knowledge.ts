import { http } from '@/lib/http/request'
import type { PageResult } from '@/types/common'
import type {
  KnowledgeCreateRequest,
  KnowledgeDocument,
  KnowledgeQuery,
} from '@/types/knowledge'

export const knowledgeApi = {
  page: (query: KnowledgeQuery) =>
    http.get<PageResult<KnowledgeDocument>>('/knowledge/documents', query),
  detail: (documentId: number) =>
    http.get<KnowledgeDocument>(`/knowledge/documents/${documentId}`),
  create: (data: KnowledgeCreateRequest) =>
    http.post<number>('/knowledge/documents', data),
  publish: (documentId: number) =>
    http.post<void>(`/knowledge/documents/${documentId}/publish`),
  offline: (documentId: number) =>
    http.post<void>(`/knowledge/documents/${documentId}/offline`),
}
