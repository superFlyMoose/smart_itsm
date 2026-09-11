import type {
  AiTaskStatus,
  AiTaskType,
} from '@/types/ai'
import type { KnowledgeStatus } from '@/types/knowledge'
import type {
  CollaborationStatus,
  TicketAction,
  TicketPriority,
  TicketStatus,
  TransferRequestStatus,
} from '@/types/ticket'
import type { UserStatus } from '@/types/organization'

/** 徽标语义色调，与状态语义一一对应，不做装饰用途 */
export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'violet'

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; tone: Tone }> = {
  OPEN: { label: '待分配', tone: 'warning' },
  ASSIGNED: { label: '待接受', tone: 'brand' },
  PROCESSING: { label: '处理中', tone: 'brand' },
  WAITING_COLLABORATION: { label: '协作中', tone: 'violet' },
  WAITING_CONFIRM: { label: '待确认', tone: 'warning' },
  CLOSED: { label: '已关闭', tone: 'success' },
  CANCELLED: { label: '已取消', tone: 'neutral' },
}

export const TICKET_STATUS_OPTIONS = Object.entries(TICKET_STATUS_META).map(
  ([value, meta]) => ({ value: value as TicketStatus, label: meta.label }),
)

export const PRIORITY_META: Record<TicketPriority, { label: string; tone: Tone }> = {
  URGENT: { label: '紧急', tone: 'danger' },
  HIGH: { label: '高', tone: 'warning' },
  MEDIUM: { label: '中', tone: 'brand' },
  LOW: { label: '低', tone: 'neutral' },
}

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_META).map(
  ([value, meta]) => ({ value: value as TicketPriority, label: meta.label }),
)

export const COLLABORATION_STATUS_META: Record<
  CollaborationStatus,
  { label: string; tone: Tone }
> = {
  PENDING: { label: '待接受', tone: 'warning' },
  PROCESSING: { label: '处理中', tone: 'brand' },
  COMPLETED: { label: '已完成', tone: 'success' },
  CANCELLED: { label: '已取消', tone: 'neutral' },
}

export const KNOWLEDGE_STATUS_META: Record<KnowledgeStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: '草稿', tone: 'neutral' },
  PUBLISHED: { label: '已发布', tone: 'success' },
  OFFLINE: { label: '已下线', tone: 'warning' },
}

export const KNOWLEDGE_STATUS_OPTIONS = Object.entries(KNOWLEDGE_STATUS_META).map(
  ([value, meta]) => ({ value: value as KnowledgeStatus, label: meta.label }),
)

export const AI_TASK_STATUS_META: Record<AiTaskStatus, { label: string; tone: Tone }> = {
  PENDING: { label: '待执行', tone: 'warning' },
  RUNNING: { label: '执行中', tone: 'brand' },
  SUCCESS: { label: '成功', tone: 'success' },
  FAILED: { label: '失败', tone: 'danger' },
}

export const AI_TASK_TYPE_META: Record<AiTaskType, string> = {
  TICKET_CLASSIFICATION: '智能分类',
  TICKET_SOLUTION_SUGGESTION: '解决方案推荐',
  KNOWLEDGE_RETRIEVAL: '知识检索',
  TICKET_SUMMARY: '工单摘要',
}

export const USER_STATUS_META: Record<UserStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: '正常', tone: 'success' },
  DISABLED: { label: '已禁用', tone: 'danger' },
}

export const ACTION_META: Record<TicketAction, string> = {
  CREATE: '创建工单',
  ASSIGN: '分配工单',
  ACCEPT: '接受工单',
  TRANSFER: '转派工单',
  PROCESS: '记录处理过程',
  COLLABORATE: '发起协作',
  COLLABORATION_COMPLETE: '完成协作',
  RESOLVE: '提交解决方案',
  REJECT_RESOLUTION: '拒绝解决方案',
  CANCEL: '取消工单',
  CLOSE: '确认关闭',
  ESCALATE: '工单升级',
  NUDGE: '催办',
  RATE: '评价工单',
}

/** 通知类型中文文案 */
export const NOTIFICATION_TYPE_META: Record<string, string> = {
  TICKET_ASSIGNED: '工单分配',
  TICKET_ACCEPTED: '工单接受',
  TICKET_TRANSFERRED: '工单转派',
  TICKET_COMMENTED: '工单评论',
  TICKET_COLLABORATION: '协作邀请',
  TICKET_RESOLVED: '解决方案提交',
  TICKET_REJECTED: '方案被拒绝',
  TICKET_CLOSED: '工单关闭',
  TICKET_CANCELLED: '工单取消',
  TICKET_NUDGE: '工单催办',
  TICKET_ESCALATED: '工单升级',
  SLA_WARNING: 'SLA 预警',
  SLA_BREACHED: 'SLA 超时',
  TRANSFER_REQUEST_RECEIVED: '转派申请待审批',
  TRANSFER_REQUEST_APPROVED: '转派申请已通过',
  TRANSFER_REQUEST_REJECTED: '转派申请被拒绝',
  TRANSFER_REQUEST_CANCELLED: '转派申请已撤销',
}

/** 角色中文文案 */
export const ROLE_META: Record<string, string> = {
  USER: '普通用户',
  ENGINEER: '工程师',
  TEAM_MANAGER: '团队负责人',
  ADMIN: '系统管理员',
}

export const ENABLED_LABEL: Record<number, string> = {
  1: '启用',
  0: '禁用',
}

export const TRANSFER_REQUEST_STATUS_META: Record<
  TransferRequestStatus,
  { label: string; tone: Tone }
> = {
  PENDING: { label: '待审批', tone: 'warning' },
  APPROVED: { label: '已通过', tone: 'success' },
  REJECTED: { label: '已拒绝', tone: 'danger' },
  CANCELLED: { label: '已撤销', tone: 'neutral' },
}

export const TRANSFER_REQUEST_STATUS_OPTIONS = Object.entries(
  TRANSFER_REQUEST_STATUS_META,
).map(([value, meta]) => ({
  value: value as TransferRequestStatus,
  label: meta.label,
}))

/** 通用分页页长选项 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50]
