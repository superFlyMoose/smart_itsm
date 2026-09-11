package com.itsm.smartitsm.common.enums;

/**
 * 知识文档状态枚举
 */
public enum KnowledgeStatusEnum {

    DRAFT("草稿"),
    PUBLISHED("已发布"),
    OFFLINE("已下线");

    private final String statusName;

    KnowledgeStatusEnum(String statusName) {
        this.statusName = statusName;
    }

    public String getStatusName() {
        return statusName;
    }
}
