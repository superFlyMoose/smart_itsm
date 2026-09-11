package com.itsm.smartitsm.module.sla.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * SLA 工单列表项 VO
 */
@Data
public class SlaTicketVO {

    private Long ticketId;
    private String ticketNo;
    private String title;
    private String priority;
    private String status;
    private String statusName;
    private Long teamId;
    private String teamName;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime responseDeadline;
    private LocalDateTime resolveDeadline;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private Boolean responseBreached;
    private Boolean resolveBreached;
}
