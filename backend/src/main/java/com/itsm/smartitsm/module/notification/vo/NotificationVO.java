package com.itsm.smartitsm.module.notification.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知 VO
 */
@Data
public class NotificationVO {

    private Long id;
    private String type;
    private String title;
    private String content;
    private String relatedType;
    private Long relatedId;
    /** 是否已读 */
    private Boolean isRead;
    private LocalDateTime createdAt;
}
