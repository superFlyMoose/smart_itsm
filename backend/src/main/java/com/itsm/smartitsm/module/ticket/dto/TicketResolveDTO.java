package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 提交解决方案 DTO
 */
@Data
public class TicketResolveDTO {

    @NotBlank(message = "解决方案不能为空")
    private String resolution;

    private String remark;
}
