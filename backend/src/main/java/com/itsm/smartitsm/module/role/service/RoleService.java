package com.itsm.smartitsm.module.role.service;

import com.itsm.smartitsm.module.role.dto.RoleCreateDTO;
import com.itsm.smartitsm.module.role.vo.RoleVO;

import java.util.List;

/**
 * 角色权限服务
 */
public interface RoleService {

    /**
     * 查询全部角色（含权限）
     */
    List<RoleVO> listRoles();

    /**
     * 创建角色
     */
    Long createRole(RoleCreateDTO dto);

    /**
     * 给角色分配权限（全量覆盖）
     */
    void assignPermissions(Long roleId, List<Long> permissionIds);
}
