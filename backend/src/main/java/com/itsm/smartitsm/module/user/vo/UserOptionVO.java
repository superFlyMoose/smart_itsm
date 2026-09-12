package com.itsm.smartitsm.module.user.vo;

import lombok.Data;

/**
 * 用户简要选项 VO：供协作人选择等下拉场景使用，
 * 仅暴露最小字段，避免向无 user:manage 权限的用户泄露手机号、邮箱、角色等敏感信息
 */
@Data
public class UserOptionVO {

    private Long id;
    private String username;
    private String realName;
    private String departmentName;
}
