package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单协作表 ticket_collaboration
 */
@Data
@TableName("ticket_collaboration")
public class TicketCollaboration {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 发起协作人ID */
    private Long requesterId;

    /** 协作人ID */
    private Long collaboratorId;

    /** 协作说明 */
    private String message;

    /** 状态：PENDING/PROCESSING/COMPLETED/CANCELLED */
    private String status;

    private LocalDateTime createdAt;

    /** 完成时间 */
    private LocalDateTime completedAt;
}
