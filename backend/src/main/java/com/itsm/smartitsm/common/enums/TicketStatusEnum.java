package com.itsm.smartitsm.common.enums;

/**
 * 工单状态枚举
 */
public enum TicketStatusEnum {

    OPEN("待分配"),
    ASSIGNED("待接受"),
    PROCESSING("处理中"),
    WAITING_COLLABORATION("协作中"),
    WAITING_CONFIRM("待确认"),
    CLOSED("已关闭"),
    CANCELLED("已取消");

    private final String statusName;

    TicketStatusEnum(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }

    /**
     * 根据状态编码获取中文名称
     */
    public static String getNameByCode(String code) {
        if (code == null) {
            return null;
        }
        for (TicketStatusEnum status : values()) {
            if (status.name().equals(code)) {
                return status.statusName;
            }
        }
        return code;
    }

    /**
     * 是否为终态
     */
    public boolean isTerminal() {
        return this == CLOSED || this == CANCELLED;
    }
}
