package com.itsm.smartitsm.security;

import com.itsm.smartitsm.module.user.entity.SysUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * 登录用户鉴权快照（Redis 缓存载体）。
 * 注意：出于安全考虑不缓存密码，{@link SysUser#getPassword()} 为 null，
 * 该快照仅用于 JWT 过滤器重建 SecurityContext，不用于登录密码校验。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUserSnapshot {

    /** 用户实体（password 字段置空） */
    private SysUser user;

    /** 角色编码集合 */
    private Set<String> roles;

    /** 权限编码集合 */
    private Set<String> permissions;
}
