package com.itsm.smartitsm.module.knowledge.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识库文本块表 knowledge_chunk
 */
@Data
@TableName("knowledge_chunk")
public class KnowledgeChunk {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 文档ID */
    private Long documentId;

    /** 文本内容 */
    private String content;

    /** 文本块序号 */
    private Integer chunkIndex;

    /** 元数据（JSON） */
    private String metadata;

    private LocalDateTime createdAt;
}
