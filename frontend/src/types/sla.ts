import type { PageQuery } from './common'
import type { TicketPriority, TicketStatus } from './ticket'

/** SLA 规则 */
export interface SlaRule {
  id: number
  name: string
  priority: TicketPriority
  responseMinutes: number
  resolveMinutes: number
  escalationMinutes: number | null
  /** 1 启用 0 禁用 */
  status: number
}

export interface SlaRuleSaveRequest {
  name: string
  priority: TicketPriority
  responseMinutes: number
  resolveMinutes: number
  escalationMinutes?: number | null
}

/** 单工单 SLA 详情 */
export interface TicketSla {
  ticketId: number
  responseDeadline: string
  resolveDeadline: string
  firstResponseAt: string | null
  resolvedAt: string | null
  responseBreached: boolean
  resolveBreached: boolean
}

/** SLA 工单列表项 */
export interface SlaTicket {
  ticketId: number
  ticketNo: string
  title: string
  priority: TicketPriority
  status: TicketStatus
  statusName: string
  teamId: number | null
  teamName: string | null
  assigneeId: number | null
  assigneeName: string | null
  responseDeadline: string
  resolveDeadline: string
  firstResponseAt: string | null
  resolvedAt: string | null
  responseBreached: boolean
  resolveBreached: boolean
}

export interface SlaTicketQuery extends PageQuery {
  priority?: TicketPriority
  responseBreached?: boolean
  resolveBreached?: boolean
  teamId?: number
  startTime?: string
  endTime?: string
}
