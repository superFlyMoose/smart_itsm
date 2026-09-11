package com.itsm.smartitsm.module.permission.service;

import com.itsm.smartitsm.module.permission.vo.PermissionVO;

import java.util.List;

/**
 * 权限服务
 */
public interface PermissionService {

    /**
     * 查询全部权限列表（按 ID 升序），供角色权限分配使用
     */
    List<PermissionVO> listPermissions();
}
