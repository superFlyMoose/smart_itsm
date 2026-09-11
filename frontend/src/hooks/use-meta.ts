import { useQuery } from '@tanstack/react-query'
import {
  categoryApi,
  departmentApi,
  permissionApi,
  roleApi,
  teamApi,
} from '@/api/organization'
import { queryKeys } from './query-keys'

export function useCategoryTree(enabled = true) {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: categoryApi.tree,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useDepartmentTree(enabled = true) {
  return useQuery({
    queryKey: queryKeys.departments.tree(),
    queryFn: departmentApi.tree,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useTeams(enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: teamApi.list,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useTeamDetail(teamId: number | null) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId ?? 0),
    queryFn: () => teamApi.detail(teamId as number),
    enabled: teamId != null,
  })
}

export function useRoles(enabled = true) {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: roleApi.list,
    enabled,
  })
}

export function usePermissions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.permissions.list(),
    queryFn: permissionApi.list,
    enabled,
  })
}
