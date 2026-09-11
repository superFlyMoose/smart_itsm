package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 拒绝解决方案 DTO
 */
@Data
public class TicketRejectDTO {

    @NotBlank(message = "拒绝原因不能为空")
    private String reason;
}
