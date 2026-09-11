package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单详情 VO
 */
@Data
public class TicketDetailVO {

    private Long id;
    private String ticketNo;
    private String title;
    private String description;
    private SimpleUserVO creator;
    private SimpleRefVO department;
    private SimpleRefVO team;
    private SimpleUserVO assignee;
    private SimpleRefVO category;
    private String priority;
    private String priorityName;
    private String status;
    private String statusName;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
