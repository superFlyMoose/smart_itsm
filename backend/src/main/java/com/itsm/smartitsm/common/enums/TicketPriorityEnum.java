package com.itsm.smartitsm.common.enums;

/**
 * 工单优先级枚举
 */
public enum TicketPriorityEnum {

    URGENT("紧急"),
    HIGH("高"),
    MEDIUM("中"),
    LOW("低");

    private final String priorityName;

    TicketPriorityEnum(String priorityName) {
        this.priorityName = priorityName;
    }

    public String getPriorityName() {
        return priorityName;
    }

    /**
     * 根据优先级编码获取中文名称
     */
    public static String getNameByCode(String code) {
        if (code == null) {
            return null;
        }
        for (TicketPriorityEnum priority : values()) {
            if (priority.name().equals(code)) {
                return priority.priorityName;
            }
        }
        return code;
    }
}
