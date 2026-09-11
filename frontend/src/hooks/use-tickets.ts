import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ticketApi } from '@/api/tickets'
import { queryKeys } from './query-keys'
import type {
  AssignRequest,
  CancelRequest,
  CollaborationCreateRequest,
  CommentCreateRequest,
  EscalateRequest,
  NudgeRequest,
  ProcessRequest,
  RatingCreateRequest,
  RejectRequest,
  ResolveRequest,
  TicketCreateRequest,
  TicketQuery,
  TransferRequest,
} from '@/types/ticket'

export function useTickets(query: TicketQuery) {
  return useQuery({
    queryKey: queryKeys.tickets.list(query),
    queryFn: () => ticketApi.page(query),
  })
}

export function useTicketDetail(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => ticketApi.detail(ticketId),
  })
}

export function useTicketComments(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.comments(ticketId),
    queryFn: () => ticketApi.comments(ticketId),
  })
}

export function useTicketHistory(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.history(ticketId),
    queryFn: () => ticketApi.history(ticketId),
  })
}

export function useCollaborations(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.collaborations(ticketId),
    queryFn: () => ticketApi.collaborations(ticketId),
  })
}

export function useAttachments(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.attachments(ticketId),
    queryFn: () => ticketApi.attachments(ticketId),
  })
}

export function useTicketRating(ticketId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.tickets.rating(ticketId),
    queryFn: () => ticketApi.rating(ticketId),
    enabled,
    retry: false,
  })
}

/** 工单写操作统一集合，所有变更后刷新详情与列表 */
export function useTicketMutations(ticketId: number) {
  const qc = useQueryClient()

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['tickets'] })
  }

  const create = useMutation({
    mutationFn: (data: TicketCreateRequest) => ticketApi.create(data),
  })

  const assign = useMutation({
    mutationFn: (data: AssignRequest) => ticketApi.assign(ticketId, data),
    onSuccess: refresh,
  })

  const accept = useMutation({
    mutationFn: () => ticketApi.accept(ticketId),
    onSuccess: refresh,
  })

  const transfer = useMutation({
    mutationFn: (data: TransferRequest) => ticketApi.transfer(ticketId, data),
    onSuccess: refresh,
  })

  const process = useMutation({
    mutationFn: (data: ProcessRequest) => ticketApi.process(ticketId, data),
    onSuccess: refresh,
  })

  const resolve = useMutation({
    mutationFn: (data: ResolveRequest) => ticketApi.resolve(ticketId, data),
    onSuccess: refresh,
  })

  const confirm = useMutation({
    mutationFn: () => ticketApi.confirm(ticketId),
    onSuccess: refresh,
  })

  const reject = useMutation({
    mutationFn: (data: RejectRequest) => ticketApi.reject(ticketId, data),
    onSuccess: refresh,
  })

  const cancel = useMutation({
    mutationFn: (data: CancelRequest) => ticketApi.cancel(ticketId, data),
    onSuccess: refresh,
  })

  const nudge = useMutation({
    mutationFn: (data: NudgeRequest) => ticketApi.nudge(ticketId, data),
    onSuccess: refresh,
  })

  const escalate = useMutation({
    mutationFn: (data: EscalateRequest) => ticketApi.escalate(ticketId, data),
    onSuccess: refresh,
  })

  const addComment = useMutation({
    mutationFn: (data: CommentCreateRequest) => ticketApi.addComment(ticketId, data),
    onSuccess: refresh,
  })

  const createCollaboration = useMutation({
    mutationFn: (data: CollaborationCreateRequest) =>
      ticketApi.createCollaboration(ticketId, data),
    onSuccess: refresh,
  })

  const acceptCollaboration = useMutation({
    mutationFn: (collaborationId: number) =>
      ticketApi.acceptCollaboration(ticketId, collaborationId),
    onSuccess: refresh,
  })

  const completeCollaboration = useMutation({
    mutationFn: (collaborationId: number) =>
      ticketApi.completeCollaboration(ticketId, collaborationId),
    onSuccess: refresh,
  })

  const uploadAttachment = useMutation({
    mutationFn: (file: File) => ticketApi.uploadAttachment(ticketId, file),
    onSuccess: refresh,
  })

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: number) =>
      ticketApi.deleteAttachment(ticketId, attachmentId),
    onSuccess: refresh,
  })

  const rate = useMutation({
    mutationFn: (data: RatingCreateRequest) => ticketApi.rate(ticketId, data),
    onSuccess: refresh,
  })

  return {
    create,
    assign,
    accept,
    transfer,
    process,
    resolve,
    confirm,
    reject,
    cancel,
    nudge,
    escalate,
    addComment,
    createCollaboration,
    acceptCollaboration,
    completeCollaboration,
    uploadAttachment,
    deleteAttachment,
    rate,
  }
}
