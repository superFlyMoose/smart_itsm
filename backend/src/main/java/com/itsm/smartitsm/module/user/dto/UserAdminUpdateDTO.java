package com.itsm.smartitsm.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员修改用户 DTO
 */
@Data
public class UserAdminUpdateDTO {

    @Size(max = 50, message = "真实姓名长度不能超过50")
    private String realName;

    private Long departmentId;

    private String position;

    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;
}
