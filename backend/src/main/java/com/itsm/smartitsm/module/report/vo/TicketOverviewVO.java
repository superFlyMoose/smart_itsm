package com.itsm.smartitsm.module.report.vo;

import lombok.Data;

/**
 * 工单总体统计 VO
 */
@Data
public class TicketOverviewVO {

    private Long total;
    private Long open;
    private Long assigned;
    private Long processing;
    private Long waitingCollaboration;
    private Long waitingConfirm;
    private Long closed;
    private Long cancelled;
}
