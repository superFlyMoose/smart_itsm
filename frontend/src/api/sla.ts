import { http } from '@/lib/http/request'
import type { PageResult } from '@/types/common'
import type {
  SlaRule,
  SlaRuleSaveRequest,
  SlaTicket,
  SlaTicketQuery,
  TicketSla,
} from '@/types/sla'

export const slaApi = {
  ticketSla: (ticketId: number) =>
    http.get<TicketSla>(`/tickets/${ticketId}/sla`),
  pageTickets: (query: SlaTicketQuery) =>
    http.get<PageResult<SlaTicket>>('/sla/tickets', query),
  listRules: () => http.get<SlaRule[]>('/sla/rules'),
  createRule: (data: SlaRuleSaveRequest) => http.post<number>('/sla/rules', data),
  updateRule: (ruleId: number, data: SlaRuleSaveRequest) =>
    http.put<void>(`/sla/rules/${ruleId}`, data),
  disableRule: (ruleId: number) => http.post<void>(`/sla/rules/${ruleId}/disable`),
}
