package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单附件 VO
 */
@Data
public class TicketAttachmentVO {

    private Long id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String contentType;
    private Long uploaderId;
    private String uploaderName;
    private LocalDateTime createdAt;
}
