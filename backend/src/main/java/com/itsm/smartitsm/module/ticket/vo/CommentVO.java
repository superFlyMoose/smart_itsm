package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单评论 VO
 */
@Data
public class CommentVO {

    private Long id;
    private SimpleUserVO user;
    private String content;
    private LocalDateTime createdAt;
}
