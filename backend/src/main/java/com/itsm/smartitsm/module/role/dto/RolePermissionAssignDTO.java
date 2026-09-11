package com.itsm.smartitsm.module.role.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 给角色分配权限 DTO
 */
@Data
public class RolePermissionAssignDTO {

    @NotEmpty(message = "权限ID集合不能为空")
    private List<Long> permissionIds;
}
