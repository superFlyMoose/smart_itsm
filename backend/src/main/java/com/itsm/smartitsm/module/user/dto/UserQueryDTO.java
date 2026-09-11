package com.itsm.smartitsm.module.user.dto;

import lombok.Data;

/**
 * 用户分页查询条件
 */
@Data
public class UserQueryDTO {

    private String username;
    private String realName;
    private String employeeNo;
    private Long departmentId;
    /** 状态：ACTIVE/DISABLED */
    private String status;
    private Integer pageNum;
    private Integer pageSize;
}
