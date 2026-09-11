package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 转派工单 DTO
 */
@Data
public class TicketTransferDTO {

    @NotNull(message = "目标团队不能为空")
    private Long targetTeamId;

    @NotNull(message = "目标工程师不能为空")
    private Long targetAssigneeId;

    private String remark;
}
