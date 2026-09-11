package com.itsm.smartitsm.module.category.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.category.dto.CategorySaveDTO;
import com.itsm.smartitsm.module.category.service.CategoryService;
import com.itsm.smartitsm.module.category.vo.CategoryTreeVO;
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
 * 工单分类接口
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 查询分类树
     */
    @GetMapping("/tree")
    public Result<List<CategoryTreeVO>> tree() {
        return Result.success(categoryService.tree());
    }

    /**
     * 创建分类
     */
    @PostMapping
    @PreAuthorize("hasAuthority('category:manage')")
    public Result<Long> create(@Valid @RequestBody CategorySaveDTO dto) {
        return Result.success(categoryService.createCategory(dto));
    }

    /**
     * 修改分类
     */
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasAuthority('category:manage')")
    public Result<Void> update(@PathVariable Long categoryId,
                               @Valid @RequestBody CategorySaveDTO dto) {
        categoryService.updateCategory(categoryId, dto);
        return Result.success();
    }

    /**
     * 禁用分类
     */
    @PostMapping("/{categoryId}/disable")
    @PreAuthorize("hasAuthority('category:manage')")
    public Result<Void> disable(@PathVariable Long categoryId) {
        categoryService.disableCategory(categoryId);
        return Result.success();
    }
}
