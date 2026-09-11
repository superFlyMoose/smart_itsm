package com.itsm.smartitsm.common.enums;

/**
 * AI 任务状态枚举
 */
public enum AiTaskStatusEnum {

    PENDING("待执行"),
    RUNNING("执行中"),
    SUCCESS("成功"),
    FAILED("失败");

    private final String statusName;

    AiTaskStatusEnum(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }
}
