import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  categoryApi,
  departmentApi,
  roleApi,
  teamApi,
} from '@/api/organization'
import type {
  CategorySaveRequest,
  DepartmentSaveRequest,
  RoleCreateRequest,
  TeamMemberAddRequest,
  TeamSaveRequest,
} from '@/types/organization'

/** 部门/团队/分类/角色的管理写操作 */
export function useOrganizationMutations() {
  const qc = useQueryClient()

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['departments'] })
    qc.invalidateQueries({ queryKey: ['teams'] })
    qc.invalidateQueries({ queryKey: ['categories'] })
    qc.invalidateQueries({ queryKey: ['roles'] })
  }

  const saveDepartment = useMutation({
    mutationFn: async ({ id, data }: { id: number | null; data: DepartmentSaveRequest }) => {
      if (id) await departmentApi.update(id, data)
      else await departmentApi.create(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })

  const disableDepartment = useMutation({
    mutationFn: (id: number) => departmentApi.disable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })

  const saveTeam = useMutation({
    mutationFn: async ({ id, data }: { id: number | null; data: TeamSaveRequest }) => {
      if (id) await teamApi.update(id, data)
      else await teamApi.create(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })

  const addTeamMember = useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: TeamMemberAddRequest }) =>
      teamApi.addMember(teamId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })

  const removeTeamMember = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      teamApi.removeMember(teamId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })

  const saveCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number | null; data: CategorySaveRequest }) => {
      if (id) await categoryApi.update(id, data)
      else await categoryApi.create(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const disableCategory = useMutation({
    mutationFn: (id: number) => categoryApi.disable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const createRole = useMutation({
    mutationFn: (data: RoleCreateRequest) => roleApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })

  const assignRolePermissions = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleApi.assignPermissions(roleId, permissionIds),
    onSuccess: invalidateAll,
  })

  return {
    saveDepartment,
    disableDepartment,
    saveTeam,
    addTeamMember,
    removeTeamMember,
    saveCategory,
    disableCategory,
    createRole,
    assignRolePermissions,
  }
}
