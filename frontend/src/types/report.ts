export interface TicketOverview {
  total: number
  open: number
  assigned: number
  processing: number
  waitingCollaboration: number
  waitingConfirm: number
  closed: number
  cancelled: number
}

export interface TicketTrendItem {
  date: string
  createdCount: number
  closedCount: number
}

export interface CategoryStat {
  categoryId: number
  categoryName: string
  count: number
}

export interface EngineerWorkload {
  engineerId: number
  engineerName: string
  assignedCount: number
  processingCount: number
  resolvedCount: number
  closedCount: number
}

export interface SlaReport {
  totalTickets: number
  responseBreached: number
  resolveBreached: number
  responseComplianceRate: number
  resolveComplianceRate: number
}
