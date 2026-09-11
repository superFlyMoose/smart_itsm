package com.itsm.smartitsm.module.knowledge.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识文档 VO
 */
@Data
public class KnowledgeDocumentVO {

    private Long id;
    private String title;
    private String fileUrl;
    private Long categoryId;
    private String categoryName;
    private Long uploaderId;
    private String uploaderName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
