package com.itsm.smartitsm.module.report.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 工单每日趋势 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTrendVO {

    /** 日期 yyyy-MM-dd */
    private String date;
    private Long createdCount;
    private Long closedCount;
}
