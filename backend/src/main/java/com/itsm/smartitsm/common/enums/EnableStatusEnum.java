package com.itsm.smartitsm.common.enums;

/**
 * 启用状态枚举（数据库中使用 1/0 表示）
 */
public enum EnableStatusEnum {

    ENABLED(1, "启用"),
    DISABLED(0, "禁用");

    private final Integer value;
    private final String name;

    EnableStatusEnum(Integer value, String name) {
        this.value = value;
        this.name = name;
    }

    public Integer getValue() {
        return value;
    }

    public String getName() {
        return name;
    }
}
