package com.itsm.smartitsm.module.ai.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI 任务详情 VO
 */
@Data
public class AiTaskVO {

    private Long id;
    private String taskType;
    private String businessType;
    private Long businessId;
    private String status;
    private String statusName;
    private String output;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
