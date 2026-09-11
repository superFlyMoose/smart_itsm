package com.itsm.smartitsm.module.user.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 给用户分配角色 DTO
 */
@Data
public class UserRoleAssignDTO {

    @NotEmpty(message = "角色ID集合不能为空")
    private List<Long> roleIds;
}
