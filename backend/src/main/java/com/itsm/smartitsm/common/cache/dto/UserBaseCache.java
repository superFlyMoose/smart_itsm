package com.itsm.smartitsm.common.cache.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户简要信息缓存（批量名称回填用）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBaseCache {

    private Long id;

    private String username;

    private String realName;
}
