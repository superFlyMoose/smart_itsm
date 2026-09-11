package com.itsm.smartitsm.module.report.vo;

import lombok.Data;

/**
 * 工程师工作量统计 VO
 */
@Data
public class EngineerWorkloadVO {

    private Long engineerId;
    private String engineerName;
    private Long assignedCount;
    private Long processingCount;
    private Long resolvedCount;
    private Long closedCount;
}
