package com.itsm.smartitsm.common.enums;

/**
 * 工单跨团队转派申请状态枚举
 */
public enum TransferRequestStatusEnum {

    PENDING("待审批"),
    APPROVED("已通过"),
    REJECTED("已拒绝"),
    CANCELLED("已撤销");

    private final String statusName;

    TransferRequestStatusEnum(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }
}
