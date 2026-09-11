package com.itsm.smartitsm.module.auth.vo;

import lombok.Data;

import java.util.List;

/**
 * 登录用户信息 VO
 */
@Data
public class LoginUserVO {

    private Long id;
    private String username;
    private String realName;
    private String employeeNo;
    private Long departmentId;
    private List<String> roles;
    private List<String> permissions;
}
