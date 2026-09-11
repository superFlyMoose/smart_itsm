package com.itsm.smartitsm.module.knowledge.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识库文档表 knowledge_document
 */
@Data
@TableName("knowledge_document")
public class KnowledgeDocument {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 文档标题 */
    private String title;

    /** 文档地址 */
    private String fileUrl;

    /** 分类ID */
    private Long categoryId;

    /** 上传人ID */
    private Long uploaderId;

    /** 状态：DRAFT/PUBLISHED/OFFLINE */
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
