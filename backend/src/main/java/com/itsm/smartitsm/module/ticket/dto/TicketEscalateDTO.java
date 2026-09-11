package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工单升级 DTO
 */
@Data
public class TicketEscalateDTO {

    @NotBlank(message = "升级原因不能为空")
    private String reason;
}
