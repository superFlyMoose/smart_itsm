import { useQuery } from '@tanstack/react-query'
import { reportApi } from '@/api/reports'
import { queryKeys } from './query-keys'

export function useTicketOverview() {
  return useQuery({
    queryKey: queryKeys.reports.overview(),
    queryFn: reportApi.overview,
  })
}

export function useTicketTrend(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.reports.trend(startDate, endDate),
    queryFn: () => reportApi.trend(startDate, endDate),
  })
}

export function useCategoryStat() {
  return useQuery({
    queryKey: queryKeys.reports.category(),
    queryFn: reportApi.categoryStat,
  })
}

export function useEngineerWorkload() {
  return useQuery({
    queryKey: queryKeys.reports.workload(),
    queryFn: reportApi.engineerWorkload,
  })
}

export function useSlaReport() {
  return useQuery({
    queryKey: queryKeys.reports.sla(),
    queryFn: reportApi.slaReport,
  })
}
