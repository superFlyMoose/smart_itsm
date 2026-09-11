import { http } from '@/lib/http/request'
import type {
  CategorySaveRequest,
  CategoryTreeNode,
  DepartmentSaveRequest,
  DepartmentTreeNode,
  Permission,
  RoleCreateRequest,
  RoleRecord,
  TeamDetail,
  TeamMemberAddRequest,
  TeamRecord,
  TeamSaveRequest,
} from '@/types/organization'

/* 分类 */
export const categoryApi = {
  tree: () => http.get<CategoryTreeNode[]>('/categories/tree'),
  create: (data: CategorySaveRequest) => http.post<number>('/categories', data),
  update: (categoryId: number, data: CategorySaveRequest) =>
    http.put<void>(`/categories/${categoryId}`, data),
  disable: (categoryId: number) =>
    http.post<void>(`/categories/${categoryId}/disable`),
}

/* 部门 */
export const departmentApi = {
  tree: () => http.get<DepartmentTreeNode[]>('/departments/tree'),
  create: (data: DepartmentSaveRequest) => http.post<number>('/departments', data),
  update: (departmentId: number, data: DepartmentSaveRequest) =>
    http.put<void>(`/departments/${departmentId}`, data),
  disable: (departmentId: number) =>
    http.post<void>(`/departments/${departmentId}/disable`),
}

/* 团队 */
export const teamApi = {
  list: () => http.get<TeamRecord[]>('/teams'),
  detail: (teamId: number) => http.get<TeamDetail>(`/teams/${teamId}`),
  create: (data: TeamSaveRequest) => http.post<number>('/teams', data),
  update: (teamId: number, data: TeamSaveRequest) =>
    http.put<void>(`/teams/${teamId}`, data),
  addMember: (teamId: number, data: TeamMemberAddRequest) =>
    http.post<void>(`/teams/${teamId}/members`, data),
  removeMember: (teamId: number, userId: number) =>
    http.delete<void>(`/teams/${teamId}/members/${userId}`),
}

/* 角色与权限 */
export const roleApi = {
  list: () => http.get<RoleRecord[]>('/roles'),
  create: (data: RoleCreateRequest) => http.post<number>('/roles', data),
  assignPermissions: (roleId: number, permissionIds: number[]) =>
    http.post<void>(`/roles/${roleId}/permissions`, { permissionIds }),
}

export const permissionApi = {
  list: () => http.get<Permission[]>('/permissions'),
}
