import { http } from '@/lib/http/request'
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResult,
  LoginUser,
  UpdateProfileRequest,
  UserProfile,
} from '@/types/auth'
import type {
  UserAdminUpdateRequest,
  UserCreateRequest,
  UserQuery,
  UserRecord,
} from '@/types/organization'
import type { PageResult } from '@/types/common'

/** 用户选项（/users/options 返回的精简结构，任意登录用户可访问） */
export interface UserOption {
  id: number
  username: string
  realName: string
  departmentName: string | null
}

export const authApi = {
  login: (data: LoginRequest) => http.rawLogin<LoginResult>('/auth/login', data),
  me: () => http.get<LoginUser>('/auth/me'),
  logout: () => http.post<void>('/auth/logout'),

  getMyProfile: () => http.get<UserProfile>('/users/me'),
  updateMyProfile: (data: UpdateProfileRequest) => http.put<void>('/users/me', data),
  changePassword: (data: ChangePasswordRequest) =>
    http.post<void>('/users/me/password', data),

  /** 获取用户精简选项列表（无需 user:manage 权限，供下拉选择使用） */
  getUserOptions: () => http.get<UserOption[]>('/users/options'),

  pageUsers: (query: UserQuery) => http.get<PageResult<UserRecord>>('/users', query),
  createUser: (data: UserCreateRequest) => http.post<UserRecord>('/users', data),
  updateUser: (userId: number, data: UserAdminUpdateRequest) =>
    http.put<void>(`/users/${userId}`, data),
  disableUser: (userId: number) => http.post<void>(`/users/${userId}/disable`),
  assignRoles: (userId: number, roleIds: number[]) =>
    http.post<void>(`/users/${userId}/roles`, { roleIds }),
}
