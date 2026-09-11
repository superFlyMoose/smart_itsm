package com.itsm.smartitsm.module.permission.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.permission.service.PermissionService;
import com.itsm.smartitsm.module.permission.vo.PermissionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 权限接口
 */
@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * 查询全部权限列表（角色权限分配时使用）
     */
    @GetMapping
    @PreAuthorize("hasAuthority('permission:manage')")
    public Result<List<PermissionVO>> list() {
        return Result.success(permissionService.listPermissions());
    }
}
