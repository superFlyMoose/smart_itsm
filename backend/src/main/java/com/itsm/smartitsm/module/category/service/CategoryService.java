package com.itsm.smartitsm.module.category.service;

import com.itsm.smartitsm.module.category.dto.CategorySaveDTO;
import com.itsm.smartitsm.module.category.vo.CategoryTreeVO;

import java.util.List;

/**
 * 工单分类服务
 */
public interface CategoryService {

    /**
     * 查询分类树
     */
    List<CategoryTreeVO> tree();

    /**
     * 创建分类
     */
    Long createCategory(CategorySaveDTO dto);

    /**
     * 修改分类
     */
    void updateCategory(Long categoryId, CategorySaveDTO dto);

    /**
     * 禁用分类（逻辑删除）
     */
    void disableCategory(Long categoryId);
}
