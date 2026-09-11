package com.itsm.smartitsm.module.ai.dto;

import com.itsm.smartitsm.common.enums.AiTaskTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建 AI 任务 DTO
 */
@Data
public class AiTaskCreateDTO {

    @NotNull(message = "AI任务类型不能为空")
    private AiTaskTypeEnum taskType;

    @NotBlank(message = "业务类型不能为空")
    private String businessType;

    @NotNull(message = "业务ID不能为空")
    private Long businessId;
}
