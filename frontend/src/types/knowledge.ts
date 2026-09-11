import type { PageQuery } from './common'

export type KnowledgeStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE'

export interface KnowledgeDocument {
  id: number
  title: string
  fileUrl: string | null
  categoryId: number | null
  categoryName: string | null
  uploaderId: number
  uploaderName: string
  status: KnowledgeStatus
  createdAt: string
  updatedAt: string
}

export interface KnowledgeQuery extends PageQuery {
  title?: string
  categoryId?: number
  status?: KnowledgeStatus
}

export interface KnowledgeCreateRequest {
  title: string
  fileUrl?: string
  categoryId?: number | null
}
