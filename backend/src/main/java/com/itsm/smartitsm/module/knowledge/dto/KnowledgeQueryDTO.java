package com.itsm.smartitsm.module.knowledge.dto;

import lombok.Data;

/**
 * 知识文档分页查询条件
 */
@Data
public class KnowledgeQueryDTO {

    private String title;
    private Long categoryId;
    /** 状态编码：DRAFT/PUBLISHED/OFFLINE */
    private String status;
    private Integer pageNum;
    private Integer pageSize;
}
