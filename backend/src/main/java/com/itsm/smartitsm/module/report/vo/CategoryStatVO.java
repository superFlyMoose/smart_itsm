package com.itsm.smartitsm.module.report.vo;

import lombok.Data;

/**
 * 工单分类统计 VO
 */
@Data
public class CategoryStatVO {

    private Long categoryId;
    private String categoryName;
    private Long count;
}
