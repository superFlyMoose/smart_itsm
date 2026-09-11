package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单协作记录 VO
 */
@Data
public class CollaborationVO {

    private Long id;
    private SimpleUserVO requester;
    private SimpleUserVO collaborator;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
