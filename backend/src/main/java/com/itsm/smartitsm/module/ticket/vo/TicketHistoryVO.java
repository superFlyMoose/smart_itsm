package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单操作历史 VO
 */
@Data
public class TicketHistoryVO {

    private Long id;
    private SimpleUserVO operator;
    private String action;
    private String fromStatus;
    private String toStatus;
    private String remark;
    private LocalDateTime createdAt;
}
