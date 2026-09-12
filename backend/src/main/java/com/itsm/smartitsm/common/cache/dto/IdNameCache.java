package com.itsm.smartitsm.common.cache.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用 ID-名称 缓存载体（团队、分类等）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdNameCache {

    private Long id;

    private String name;
}
