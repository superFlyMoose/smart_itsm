package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单列表项 VO
 */
@Data
public class TicketListVO {

    private Long id;
    private String ticketNo;
    private String title;
    private String priority;
    private String priorityName;
    private String status;
    private String statusName;
    private Long creatorId;
    private String creatorName;
    private Long assigneeId;
    private String assigneeName;
    private Long teamId;
    private String teamName;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
}
