package com.itsm.smartitsm.module.ai.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建 AI 任务返回 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiTaskCreateVO {

    private Long id;
    private String taskType;
    private String status;
}
