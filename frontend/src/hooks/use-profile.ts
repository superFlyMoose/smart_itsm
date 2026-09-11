import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { queryKeys } from './query-keys'
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '@/types/auth'

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: authApi.getMyProfile,
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateMyProfile(data),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  })
}

/** 登录后拉取权限信息（/auth/me），用于路由与按钮鉴权 */
export function useCurrentAuthUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.me,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'me'] }),
  })
}
