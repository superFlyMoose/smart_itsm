package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 处理工单（记录处理过程） DTO
 */
@Data
public class TicketProcessDTO {

    @NotBlank(message = "处理内容不能为空")
    private String content;
}
