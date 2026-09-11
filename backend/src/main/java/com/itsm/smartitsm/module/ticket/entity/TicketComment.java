package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单评论表 ticket_comment
 */
@Data
@TableName("ticket_comment")
public class TicketComment {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 评论人ID */
    private Long userId;

    /** 评论内容 */
    private String content;

    private LocalDateTime createdAt;
}
