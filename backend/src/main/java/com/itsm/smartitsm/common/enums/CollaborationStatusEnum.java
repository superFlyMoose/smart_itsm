package com.itsm.smartitsm.common.enums;

/**
 * 工单协作状态枚举
 */
public enum CollaborationStatusEnum {

    PENDING("待接受"),
    PROCESSING("处理中"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String statusName;

    CollaborationStatusEnum(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }
}
