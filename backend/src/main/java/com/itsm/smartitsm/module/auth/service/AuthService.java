package com.itsm.smartitsm.module.auth.service;

import com.itsm.smartitsm.module.auth.dto.LoginDTO;
import com.itsm.smartitsm.module.auth.vo.LoginUserVO;
import com.itsm.smartitsm.module.auth.vo.LoginVO;

/**
 * 认证服务
 */
public interface AuthService {

    /**
     * 用户登录
     */
    LoginVO login(LoginDTO dto);

    /**
     * 获取当前登录用户信息
     */
    LoginUserVO getCurrentUserInfo();

    /**
     * 退出登录（JWT 无状态模式，由前端丢弃 Token）
     */
    void logout();
}
