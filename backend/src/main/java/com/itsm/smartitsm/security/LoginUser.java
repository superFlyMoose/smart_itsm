package com.itsm.smartitsm.security;

import com.itsm.smartitsm.module.user.entity.SysUser;
import lombok.AccessLevel;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * 登录用户主体，承载用户信息、角色编码与权限编码
 */
@Getter
public class LoginUser implements UserDetails {

    private final SysUser user;
    private final Set<String> roles;
    private final Set<String> permissions;
    @Getter(AccessLevel.NONE)
    private final Collection<? extends GrantedAuthority> authorities;

    public LoginUser(SysUser user, Set<String> roles, Set<String> permissions) {
        this.user = user;
        this.roles = roles;
        this.permissions = permissions;
        Set<GrantedAuthority> authorities = new HashSet<>();
        permissions.forEach(code -> authorities.add(new SimpleGrantedAuthority(code)));
        roles.forEach(code -> authorities.add(new SimpleGrantedAuthority("ROLE_" + code)));
        this.authorities = authorities;
    }

    public Long getUserId() {
        return user.getId();
    }

    /**
     * 是否拥有指定权限编码
     */
    public boolean hasPermission(String permissionCode) {
        return permissions.contains(permissionCode);
    }

    /**
     * 是否拥有指定角色编码
     */
    public boolean hasRole(String roleCode) {
        return roles.contains(roleCode);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() != null && user.getStatus() == 1;
    }
}
