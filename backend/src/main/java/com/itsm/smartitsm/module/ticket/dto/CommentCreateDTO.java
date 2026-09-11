package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工单评论 DTO
 */
@Data
public class CommentCreateDTO {

    @NotBlank(message = "评论内容不能为空")
    private String content;
}
