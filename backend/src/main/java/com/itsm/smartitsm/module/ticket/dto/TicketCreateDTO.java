package com.itsm.smartitsm.module.ticket.dto;

import com.itsm.smartitsm.common.enums.TicketPriorityEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 创建工单 DTO
 */
@Data
public class TicketCreateDTO {

    @NotBlank(message = "工单标题不能为空")
    @Size(max = 200, message = "工单标题长度不能超过200")
    private String title;

    @NotBlank(message = "问题描述不能为空")
    @Size(max = 5000, message = "问题描述长度不能超过5000")
    private String description;

    @NotNull(message = "工单分类不能为空")
    private Long categoryId;

    @NotNull(message = "优先级不能为空")
    private TicketPriorityEnum priority;

    /** 指定处理团队（可选） */
    private Long teamId;

    /** 附件ID集合（可选） */
    private List<Long> attachmentIds;
}
