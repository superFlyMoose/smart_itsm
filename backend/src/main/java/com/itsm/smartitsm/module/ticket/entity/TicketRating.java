package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单评价表 ticket_rating
 */
@Data
@TableName("ticket_rating")
public class TicketRating {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 评价人ID */
    private Long userId;

    /** 评分：1-5星 */
    private Integer score;

    /** 评价内容 */
    private String comment;

    private LocalDateTime createdAt;
}
