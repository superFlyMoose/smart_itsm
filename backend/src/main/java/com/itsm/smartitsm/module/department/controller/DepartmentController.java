package com.itsm.smartitsm.module.department.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.department.dto.DepartmentSaveDTO;
import com.itsm.smartitsm.module.department.service.DepartmentService;
import com.itsm.smartitsm.module.department.vo.DepartmentTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 部门接口
 */
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * 查询部门树
     */
    @GetMapping("/tree")
    public Result<List<DepartmentTreeVO>> tree() {
        return Result.success(departmentService.tree());
    }

    /**
     * 创建部门
     */
    @PostMapping
    @PreAuthorize("hasAuthority('department:manage')")
    public Result<Long> create(@Valid @RequestBody DepartmentSaveDTO dto) {
        return Result.success(departmentService.createDepartment(dto));
    }

    /**
     * 修改部门
     */
    @PutMapping("/{departmentId}")
    @PreAuthorize("hasAuthority('department:manage')")
    public Result<Void> update(@PathVariable Long departmentId,
                               @Valid @RequestBody DepartmentSaveDTO dto) {
        departmentService.updateDepartment(departmentId, dto);
        return Result.success();
    }

    /**
     * 禁用部门
     */
    @PostMapping("/{departmentId}/disable")
    @PreAuthorize("hasAuthority('department:manage')")
    public Result<Void> disable(@PathVariable Long departmentId) {
        departmentService.disableDepartment(departmentId);
        return Result.success();
    }
}
