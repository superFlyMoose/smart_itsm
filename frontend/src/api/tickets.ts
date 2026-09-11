import { http } from '@/lib/http/request'
import type { PageResult } from '@/types/common'
import type {
  AssignRequest,
  CancelRequest,
  Collaboration,
  CollaborationCreateRequest,
  Comment,
  CommentCreateRequest,
  EscalateRequest,
  NudgeRequest,
  ProcessRequest,
  RatingCreateRequest,
  RejectRequest,
  ResolveRequest,
  TicketAttachment,
  TicketCreateRequest,
  TicketCreateResult,
  TicketDetail,
  TicketHistory,
  TicketListItem,
  TicketQuery,
  TicketRating,
  TransferRequest,
} from '@/types/ticket'

export const ticketApi = {
  page: (query: TicketQuery) => http.get<PageResult<TicketListItem>>('/tickets', query),
  detail: (ticketId: number) => http.get<TicketDetail>(`/tickets/${ticketId}`),
  create: (data: TicketCreateRequest) => http.post<TicketCreateResult>('/tickets', data),

  assign: (ticketId: number, data: AssignRequest) =>
    http.post<void>(`/tickets/${ticketId}/assign`, data),
  accept: (ticketId: number) => http.post<void>(`/tickets/${ticketId}/accept`),
  transfer: (ticketId: number, data: TransferRequest) =>
    http.post<void>(`/tickets/${ticketId}/transfer`, data),
  process: (ticketId: number, data: ProcessRequest) =>
    http.post<void>(`/tickets/${ticketId}/process`, data),
  resolve: (ticketId: number, data: ResolveRequest) =>
    http.post<void>(`/tickets/${ticketId}/resolve`, data),
  confirm: (ticketId: number) => http.post<void>(`/tickets/${ticketId}/confirm`),
  reject: (ticketId: number, data: RejectRequest) =>
    http.post<void>(`/tickets/${ticketId}/reject`, data),
  cancel: (ticketId: number, data: CancelRequest = {}) =>
    http.post<void>(`/tickets/${ticketId}/cancel`, data),
  nudge: (ticketId: number, data: NudgeRequest = {}) =>
    http.post<void>(`/tickets/${ticketId}/nudge`, data),
  escalate: (ticketId: number, data: EscalateRequest) =>
    http.post<void>(`/tickets/${ticketId}/escalate`, data),

  comments: (ticketId: number) =>
    http.get<Comment[]>(`/tickets/${ticketId}/comments`),
  addComment: (ticketId: number, data: CommentCreateRequest) =>
    http.post<number>(`/tickets/${ticketId}/comments`, data),

  history: (ticketId: number) =>
    http.get<TicketHistory[]>(`/tickets/${ticketId}/history`),

  collaborations: (ticketId: number) =>
    http.get<Collaboration[]>(`/tickets/${ticketId}/collaborations`),
  createCollaboration: (ticketId: number, data: CollaborationCreateRequest) =>
    http.post<number>(`/tickets/${ticketId}/collaborations`, data),
  acceptCollaboration: (ticketId: number, collaborationId: number) =>
    http.post<void>(`/tickets/${ticketId}/collaborations/${collaborationId}/accept`),
  completeCollaboration: (ticketId: number, collaborationId: number) =>
    http.post<void>(`/tickets/${ticketId}/collaborations/${collaborationId}/complete`),

  attachments: (ticketId: number) =>
    http.get<TicketAttachment[]>(`/tickets/${ticketId}/attachments`),
  uploadAttachment: (ticketId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.upload<TicketAttachment>(`/tickets/${ticketId}/attachments`, formData)
  },
  deleteAttachment: (ticketId: number, attachmentId: number) =>
    http.delete<void>(`/tickets/${ticketId}/attachments/${attachmentId}`),

  rate: (ticketId: number, data: RatingCreateRequest) =>
    http.post<void>(`/tickets/${ticketId}/rating`, data),
  rating: (ticketId: number) =>
    http.get<TicketRating>(`/tickets/${ticketId}/rating`),
}
