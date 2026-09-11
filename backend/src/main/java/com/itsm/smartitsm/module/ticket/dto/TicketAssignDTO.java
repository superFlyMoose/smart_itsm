package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 分配工单 DTO
 */
@Data
public class TicketAssignDTO {

    @NotNull(message = "处理团队不能为空")
    private Long teamId;

    @NotNull(message = "处理工程师不能为空")
    private Long assigneeId;

    private String remark;
}
