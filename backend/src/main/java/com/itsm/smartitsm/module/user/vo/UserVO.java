package com.itsm.smartitsm.module.user.vo;

import lombok.Data;

import java.util.List;

/**
 * 用户信息 VO
 */
@Data
public class UserVO {

    private Long id;
    private String username;
    private String employeeNo;
    private String realName;
    private Long departmentId;
    private String departmentName;
    private String position;
    private String phone;
    private String email;
    /** 状态：ACTIVE/DISABLED */
    private String status;
    /** 角色编码集合 */
    private List<String> roles;
}
