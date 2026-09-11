package com.itsm.smartitsm.module.permission.vo;

import lombok.Data;

/**
 * 权限 VO，供角色权限分配与权限列表展示使用
 */
@Data
public class PermissionVO {

    private Long id;
    private String permissionCode;
    private String permissionName;
    private String description;
}
