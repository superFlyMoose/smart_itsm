import type { PageQuery } from './common'

/* ============ 用户 ============ */

export type UserStatus = 'ACTIVE' | 'DISABLED'

export interface UserRecord {
  id: number
  username: string
  employeeNo: string
  realName: string
  departmentId: number | null
  departmentName: string | null
  position: string | null
  phone: string | null
  email: string | null
  status: UserStatus
  roles: string[]
}

export interface UserQuery extends PageQuery {
  username?: string
  realName?: string
  employeeNo?: string
  departmentId?: number
  status?: UserStatus
}

export interface UserCreateRequest {
  username: string
  password: string
  employeeNo: string
  realName: string
  departmentId?: number | null
  position?: string
  phone?: string
  email?: string
}

export interface UserAdminUpdateRequest {
  realName?: string
  departmentId?: number | null
  position?: string
  phone?: string
  email?: string
}

/* ============ 部门 ============ */

export interface DepartmentTreeNode {
  id: number
  name: string
  parentId: number | null
  managerId: number | null
  children: DepartmentTreeNode[]
}

export interface DepartmentSaveRequest {
  name: string
  parentId?: number | null
  managerId?: number | null
}

/* ============ 团队 ============ */

export interface TeamRecord {
  id: number
  name: string
  departmentId: number
  departmentName: string
  managerId: number | null
  managerName: string | null
}

export interface TeamMember {
  userId: number
  username: string
  realName: string
  /** MEMBER / LEADER */
  teamRole: 'MEMBER' | 'LEADER' | string
  joinedAt: string
}

export interface TeamDetail extends TeamRecord {
  members: TeamMember[]
}

export interface TeamSaveRequest {
  name: string
  departmentId: number
  managerId?: number | null
}

export interface TeamMemberAddRequest {
  userId: number
  teamRole?: string
}

/* ============ 分类 ============ */

export interface CategoryTreeNode {
  id: number
  name: string
  parentId: number | null
  description: string | null
  children: CategoryTreeNode[]
}

export interface CategorySaveRequest {
  name: string
  parentId?: number | null
  description?: string
}

/* ============ 角色/权限 ============ */

export interface Permission {
  id: number
  permissionCode: string
  permissionName: string
  description?: string
}

export interface RolePermission {
  id: number
  permissionCode: string
  permissionName: string
}

export interface RoleRecord {
  id: number
  roleCode: string
  roleName: string
  description: string | null
  permissions: RolePermission[] | null
}

export interface RoleCreateRequest {
  roleCode: string
  roleName: string
  description?: string
}

export interface AssignRolesRequest {
  roleIds: number[]
}

export interface AssignPermissionsRequest {
  permissionIds: number[]
}
