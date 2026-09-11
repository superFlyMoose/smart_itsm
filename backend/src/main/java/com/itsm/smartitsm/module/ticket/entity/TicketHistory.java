package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单操作历史表 ticket_history
 */
@Data
@TableName("ticket_history")
public class TicketHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 操作人ID */
    private Long operatorId;

    /** 操作类型（TicketActionEnum） */
    private String action;

    /** 原状态 */
    private String fromStatus;

    /** 新状态 */
    private String toStatus;

    /** 操作说明 */
    private String remark;

    private LocalDateTime createdAt;
}
