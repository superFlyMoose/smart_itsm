import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transferRequestApi } from '@/api/transfer-requests'
import { queryKeys } from './query-keys'
import type {
  TransferRequestAudit,
  TransferRequestQuery,
} from '@/types/ticket'

export function useTransferRequests(query: TransferRequestQuery) {
  return useQuery({
    queryKey: queryKeys.transferRequests.list(query),
    queryFn: () => transferRequestApi.page(query),
  })
}

export function useTransferRequestDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.transferRequests.detail(id),
    queryFn: () => transferRequestApi.detail(id),
  })
}

/** 转派申请审批操作，审批通过会改变工单归属，需同时刷新工单相关查询 */
export function useTransferRequestMutations() {
  const qc = useQueryClient()

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['transfer-requests'] })
    void qc.invalidateQueries({ queryKey: ['tickets'] })
  }

  const approve = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TransferRequestAudit }) =>
      transferRequestApi.approve(id, data),
    onSuccess: refresh,
  })

  const reject = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TransferRequestAudit }) =>
      transferRequestApi.reject(id, data),
    onSuccess: refresh,
  })

  const cancel = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TransferRequestAudit }) =>
      transferRequestApi.cancel(id, data),
    onSuccess: refresh,
  })

  return { approve, reject, cancel }
}
