/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
}

/** 登录用户信息 */
export interface LoginUser {
  id: number
  username: string
  realName: string
  employeeNo: string
  departmentId: number | null
  roles: string[]
  permissions: string[]
}

/** 登录返回 */
export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  user: LoginUser
}

/** 当前用户档案（users/me） */
export interface UserProfile {
  id: number
  username: string
  employeeNo: string
  realName: string
  departmentId: number | null
  departmentName: string | null
  position: string | null
  phone: string | null
  email: string | null
  status: 'ACTIVE' | 'DISABLED'
  roles: string[]
}

export interface UpdateProfileRequest {
  realName?: string
  phone?: string
  email?: string
  position?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
