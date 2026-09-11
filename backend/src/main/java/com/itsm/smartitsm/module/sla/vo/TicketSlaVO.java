package com.itsm.smartitsm.module.sla.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单SLA详情 VO
 */
@Data
public class TicketSlaVO {

    private Long ticketId;
    private LocalDateTime responseDeadline;
    private LocalDateTime resolveDeadline;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private Boolean responseBreached;
    private Boolean resolveBreached;
}
