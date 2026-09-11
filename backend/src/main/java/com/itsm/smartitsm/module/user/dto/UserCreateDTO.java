package com.itsm.smartitsm.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员创建用户 DTO
 */
@Data
public class UserCreateDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(max = 50, message = "用户名长度不能超过50")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度需在6~50之间")
    private String password;

    @NotBlank(message = "员工编号不能为空")
    @Size(max = 50, message = "员工编号长度不能超过50")
    private String employeeNo;

    @NotBlank(message = "真实姓名不能为空")
    @Size(max = 50, message = "真实姓名长度不能超过50")
    private String realName;

    private Long departmentId;

    private String position;

    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;
}
