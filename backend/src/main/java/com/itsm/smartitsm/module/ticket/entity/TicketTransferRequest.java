package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单跨团队转派申请表 ticket_transfer_request
 */
@Data
@TableName("ticket_transfer_request")
public class TicketTransferRequest {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 发起人ID（原团队负责人/工程师/管理员） */
    private Long requesterId;

    /** 原团队ID */
    private Long fromTeamId;

    /** 目标团队ID */
    private Long toTeamId;

    /** 目标工程师ID */
    private Long targetAssigneeId;

    /** 转派原因 */
    private String reason;

    /** 状态：PENDING/APPROVED/REJECTED/CANCELLED */
    private String status;

    /** 审批人ID（目标团队负责人） */
    private Long approverId;

    /** 审批意见 */
    private String approveRemark;

    /** 审批时间 */
    private LocalDateTime approvedAt;

    /** 执行转移时间（审批通过后实际转移工单） */
    private LocalDateTime executedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
