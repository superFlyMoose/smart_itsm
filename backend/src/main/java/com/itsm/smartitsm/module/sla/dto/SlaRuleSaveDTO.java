package com.itsm.smartitsm.module.sla.dto;

import com.itsm.smartitsm.common.enums.TicketPriorityEnum;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * SLA规则创建/修改 DTO
 */
@Data
public class SlaRuleSaveDTO {

    @NotBlank(message = "规则名称不能为空")
    private String name;

    @NotNull(message = "优先级不能为空")
    private TicketPriorityEnum priority;

    @NotNull(message = "首次响应时限不能为空")
    @Min(value = 1, message = "首次响应时限必须大于0")
    private Integer responseMinutes;

    @NotNull(message = "解决时限不能为空")
    @Min(value = 1, message = "解决时限必须大于0")
    private Integer resolveMinutes;

    private Integer escalationMinutes;
}
