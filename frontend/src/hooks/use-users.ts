import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { queryKeys } from './query-keys'
import type {
  UserAdminUpdateRequest,
  UserCreateRequest,
  UserQuery,
} from '@/types/organization'

export function useUsers(query: UserQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => authApi.pageUsers(query),
  })
}

export function useUserMutations() {
  const qc = useQueryClient()
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['users', 'list'] })

  const createUser = useMutation({
    mutationFn: (data: UserCreateRequest) => authApi.createUser(data),
    onSuccess: invalidate,
  })

  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserAdminUpdateRequest }) =>
      authApi.updateUser(userId, data),
    onSuccess: invalidate,
  })

  const disableUser = useMutation({
    mutationFn: (userId: number) => authApi.disableUser(userId),
    onSuccess: invalidate,
  })

  const assignRoles = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      authApi.assignRoles(userId, roleIds),
    onSuccess: invalidate,
  })

  return { createUser, updateUser, disableUser, assignRoles }
}
