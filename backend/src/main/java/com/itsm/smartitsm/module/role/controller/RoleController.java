package com.itsm.smartitsm.module.role.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.role.dto.RoleCreateDTO;
import com.itsm.smartitsm.module.role.dto.RolePermissionAssignDTO;
import com.itsm.smartitsm.module.role.service.RoleService;
import com.itsm.smartitsm.module.role.vo.RoleVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 角色权限接口
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * 查询角色列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('role:manage')")
    public Result<List<RoleVO>> list() {
        return Result.success(roleService.listRoles());
    }

    /**
     * 创建角色
     */
    @PostMapping
    @PreAuthorize("hasAuthority('role:manage')")
    public Result<Long> create(@Valid @RequestBody RoleCreateDTO dto) {
        return Result.success(roleService.createRole(dto));
    }

    /**
     * 给角色分配权限
     */
    @PostMapping("/{roleId}/permissions")
    @PreAuthorize("hasAuthority('permission:manage')")
    public Result<Void> assignPermissions(@PathVariable Long roleId,
                                          @Valid @RequestBody RolePermissionAssignDTO dto) {
        roleService.assignPermissions(roleId, dto.getPermissionIds());
        return Result.success();
    }
}
