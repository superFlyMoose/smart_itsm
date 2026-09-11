package com.itsm.smartitsm.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户修改个人信息 DTO（不允许修改部门、状态、角色）
 */
@Data
public class UserProfileUpdateDTO {

    @Size(max = 50, message = "真实姓名长度不能超过50")
    private String realName;

    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String position;
}
