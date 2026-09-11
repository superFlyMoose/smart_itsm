import { http } from '@/lib/http/request'
import type {
  CategoryStat,
  EngineerWorkload,
  SlaReport,
  TicketOverview,
  TicketTrendItem,
} from '@/types/report'

export const reportApi = {
  overview: () => http.get<TicketOverview>('/reports/tickets/overview'),
  trend: (startDate?: string, endDate?: string) =>
    http.get<TicketTrendItem[]>('/reports/tickets/trend', { startDate, endDate }),
  categoryStat: () =>
    http.get<CategoryStat[]>('/reports/tickets/category'),
  engineerWorkload: () =>
    http.get<EngineerWorkload[]>('/reports/engineers/workload'),
  slaReport: () => http.get<SlaReport>('/reports/sla'),
}
