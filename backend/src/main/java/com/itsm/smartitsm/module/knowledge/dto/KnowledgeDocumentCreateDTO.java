package com.itsm.smartitsm.module.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建知识文档 DTO
 */
@Data
public class KnowledgeDocumentCreateDTO {

    @NotBlank(message = "文档标题不能为空")
    @Size(max = 255, message = "文档标题长度不能超过255")
    private String title;

    private String fileUrl;

    private Long categoryId;
}
