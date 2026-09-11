package com.itsm.smartitsm.module.ticket.dto;

import lombok.Data;

/**
 * 跨团队转派申请审批 DTO（审批通过/拒绝共用）
 */
@Data
public class TicketTransferRequestAuditDTO {

    /** 审批意见 */
    private String remark;
}
