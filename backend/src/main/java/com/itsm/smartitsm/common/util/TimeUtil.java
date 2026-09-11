package com.itsm.smartitsm.common.util;

import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 时间解析工具
 */
public final class TimeUtil {

    /**
     * 统一时间格式
     */
    public static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private TimeUtil() {
    }

    /**
     * 解析查询参数时间，支持 yyyy-MM-dd 与 yyyy-MM-dd HH:mm:ss；
     * 仅传日期时，开始时间取 00:00:00，结束时间取 23:59:59
     *
     * @param text      时间文本
     * @param endOfDay 是否按当天结束时间补齐
     */
    public static LocalDateTime parse(String text, boolean endOfDay) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String value = text.trim();
        if (value.length() == 10) {
            LocalDate date = LocalDate.parse(value);
            return endOfDay ? date.atTime(23, 59, 59) : date.atStartOfDay();
        }
        return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
    }
}
