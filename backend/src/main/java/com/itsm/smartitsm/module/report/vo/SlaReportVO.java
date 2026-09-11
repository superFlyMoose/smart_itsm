package com.itsm.smartitsm.module.report.vo;

import lombok.Data;

/**
 * SLA 达标率统计 VO
 */
@Data
public class SlaReportVO {

    private Long totalTickets;
    private Long responseBreached;
    private Long resolveBreached;
    /** 响应达标率（百分比，保留1位小数） */
    private Double responseComplianceRate;
    /** 解决达标率（百分比，保留1位小数） */
    private Double resolveComplianceRate;
}
