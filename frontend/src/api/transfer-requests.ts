import { http } from '@/lib/http/request'
import type { PageResult } from '@/types/common'
import type {
  TransferRequestAudit,
  TransferRequestQuery,
  TransferRequestRecord,
} from '@/types/ticket'

export const transferRequestApi = {
  page: (query: TransferRequestQuery) =>
    http.get<PageResult<TransferRequestRecord>>('/transfer-requests', query),
  detail: (id: number) =>
    http.get<TransferRequestRecord>(`/transfer-requests/${id}`),
  approve: (id: number, data: TransferRequestAudit = {}) =>
    http.post<void>(`/transfer-requests/${id}/approve`, data),
  reject: (id: number, data: TransferRequestAudit = {}) =>
    http.post<void>(`/transfer-requests/${id}/reject`, data),
  cancel: (id: number, data: TransferRequestAudit = {}) =>
    http.post<void>(`/transfer-requests/${id}/cancel`, data),
}
