import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { slaApi } from '@/api/sla'
import { queryKeys } from './query-keys'
import type { SlaRuleSaveRequest, SlaTicketQuery } from '@/types/sla'

export function useTicketSla(ticketId: number) {
  return useQuery({
    queryKey: queryKeys.tickets.sla(ticketId),
    queryFn: () => slaApi.ticketSla(ticketId),
    retry: false,
  })
}

export function useSlaTickets(query: SlaTicketQuery) {
  return useQuery({
    queryKey: queryKeys.sla.tickets(query),
    queryFn: () => slaApi.pageTickets(query),
  })
}

export function useSlaRules() {
  return useQuery({
    queryKey: queryKeys.sla.rules(),
    queryFn: slaApi.listRules,
  })
}

export function useSlaRuleMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['sla'] })

  const save = useMutation({
    mutationFn: async ({ id, data }: { id: number | null; data: SlaRuleSaveRequest }) => {
      if (id) await slaApi.updateRule(id, data)
      else await slaApi.createRule(data)
    },
    onSuccess: invalidate,
  })

  const disable = useMutation({
    mutationFn: (id: number) => slaApi.disableRule(id),
    onSuccess: invalidate,
  })

  return { save, disable }
}
