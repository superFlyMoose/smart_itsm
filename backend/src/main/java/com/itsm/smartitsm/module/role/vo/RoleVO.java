package com.itsm.smartitsm.module.role.vo;

import lombok.Data;

import java.util.List;

/**
 * 角色 VO
 */
@Data
public class RoleVO {

    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
    /** 角色拥有的权限列表 */
    private List<PermissionVO> permissions;
}
