package com.itsm.smartitsm.module.auth.vo;

import lombok.Data;

/**
 * 登录返回 VO
 */
@Data
public class LoginVO {

    /** 访问令牌 */
    private String token;

    /** 令牌类型 */
    private String tokenType;

    /** 有效期（秒） */
    private Long expiresIn;

    /** 用户信息 */
    private LoginUserVO user;
}
