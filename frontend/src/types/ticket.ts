import type { PageQuery, SimpleRef, SimpleUser } from './common'

/** 工单状态 */
export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'PROCESSING'
  | 'WAITING_COLLABORATION'
  | 'WAITING_CONFIRM'
  | 'CLOSED'
  | 'CANCELLED'

/** 工单优先级 */
export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

/** 工单操作动作（与后端 TicketActionEnum 对齐） */
export type TicketAction =
  | 'CREATE'
  | 'ASSIGN'
  | 'ACCEPT'
  | 'TRANSFER'
  | 'PROCESS'
  | 'COLLABORATE'
  | 'COLLABORATION_COMPLETE'
  | 'RESOLVE'
  | 'REJECT_RESOLUTION'
  | 'CANCEL'
  | 'CLOSE'
  | 'ESCALATE'
  | 'NUDGE'
  | 'RATE'

/** 协作状态 */
export type CollaborationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

/** 工单列表项 */
export interface TicketListItem {
  id: number
  ticketNo: string
  title: string
  priority: TicketPriority
  priorityName: string
  status: TicketStatus
  statusName: string
  creatorId: number
  creatorName: string
  assigneeId: number | null
  assigneeName: string | null
  teamId: number | null
  teamName: string | null
  categoryId: number | null
  categoryName: string | null
  createdAt: string
}

/** 工单详情 */
export interface TicketDetail {
  id: number
  ticketNo: string
  title: string
  description: string
  creator: SimpleUser
  department: SimpleRef | null
  team: SimpleRef | null
  assignee: SimpleUser | null
  category: SimpleRef | null
  priority: TicketPriority
  priorityName: string
  status: TicketStatus
  statusName: string
  firstResponseAt: string | null
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

/** 创建工单返回 */
export interface TicketCreateResult {
  id: number
  ticketNo: string
  status: TicketStatus
  statusName: string
}

/** 创建工单请求 */
export interface TicketCreateRequest {
  title: string
  description: string
  categoryId: number
  priority: TicketPriority
  teamId?: number | null
  attachmentIds?: number[]
}

/** 工单分页查询 */
export interface TicketQuery extends PageQuery {
  ticketNo?: string
  title?: string
  status?: TicketStatus
  priority?: TicketPriority
  categoryId?: number
  teamId?: number
  assigneeId?: number
  creatorId?: number
  departmentId?: number
  startTime?: string
  endTime?: string
}

export interface AssignRequest {
  teamId: number
  assigneeId: number
  remark?: string
}

export interface TransferRequest {
  targetTeamId: number
  targetAssigneeId: number
  remark?: string
}

export interface ProcessRequest {
  content: string
}

export interface ResolveRequest {
  resolution: string
  remark?: string
}

export interface RejectRequest {
  reason: string
}

export interface CancelRequest {
  reason?: string
}

export interface NudgeRequest {
  message?: string
}

export interface EscalateRequest {
  reason: string
}

export interface CommentCreateRequest {
  content: string
}

export interface CollaborationCreateRequest {
  collaboratorId: number
  message?: string
}

export interface RatingCreateRequest {
  score: number
  comment?: string
}

/** 评论 */
export interface Comment {
  id: number
  user: SimpleUser
  content: string
  createdAt: string
}

/** 操作历史 */
export interface TicketHistory {
  id: number
  operator: SimpleUser
  action: TicketAction
  fromStatus: TicketStatus | null
  toStatus: TicketStatus | null
  remark: string | null
  createdAt: string
}

/** 协作记录 */
export interface Collaboration {
  id: number
  requester: SimpleUser
  collaborator: SimpleUser
  message: string | null
  status: CollaborationStatus
  createdAt: string
  completedAt: string | null
}

/** 附件 */
export interface TicketAttachment {
  id: number
  fileName: string
  fileUrl: string
  fileSize: number
  contentType: string | null
  uploaderId: number
  uploaderName: string
  createdAt: string
}

/** 工单评价 */
export interface TicketRating {
  id: number
  ticketId: number
  user: SimpleUser
  score: number
  comment: string | null
  createdAt: string
}

/* ============ 跨团队转派申请 ============ */

/** 转派申请状态 */
export type TransferRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/** 跨团队转派申请 */
export interface TransferRequestRecord {
  id: number
  ticketId: number
  ticketNo: string
  ticketTitle: string
  requester: SimpleUser
  fromTeam: SimpleRef
  toTeam: SimpleRef
  targetAssignee: SimpleUser
  reason: string | null
  status: TransferRequestStatus
  statusName: string
  approver: SimpleUser | null
  approveRemark: string | null
  approvedAt: string | null
  executedAt: string | null
  createdAt: string
}

/** 转派申请审批/拒绝/撤销请求体 */
export interface TransferRequestAudit {
  remark?: string
}

/** 转派申请分页查询 */
export interface TransferRequestQuery extends PageQuery {
  status?: TransferRequestStatus
  ticketId?: number
}
