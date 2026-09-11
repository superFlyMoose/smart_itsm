package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单跨团队转派申请 VO
 */
@Data
public class TicketTransferRequestVO {

    private Long id;

    /** 工单简要信息 */
    private Long ticketId;
    private String ticketNo;
    private String ticketTitle;

    /** 发起人 */
    private SimpleUserVO requester;

    /** 原团队 */
    private SimpleRefVO fromTeam;

    /** 目标团队 */
    private SimpleRefVO toTeam;

    /** 目标工程师 */
    private SimpleUserVO targetAssignee;

    /** 转派原因 */
    private String reason;

    /** 状态：PENDING/APPROVED/REJECTED/CANCELLED */
    private String status;

    /** 状态名称 */
    private String statusName;

    /** 审批人 */
    private SimpleUserVO approver;

    /** 审批意见 */
    private String approveRemark;

    private LocalDateTime approvedAt;

    private LocalDateTime executedAt;

    private LocalDateTime createdAt;
}
