package com.itsm.smartitsm.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.module.permission.entity.SysPermission;
import com.itsm.smartitsm.module.permission.mapper.SysPermissionMapper;
import com.itsm.smartitsm.module.role.entity.SysRole;
import com.itsm.smartitsm.module.role.mapper.SysRoleMapper;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户认证信息加载服务
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysPermissionMapper sysPermissionMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username));
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        return buildLoginUser(user);
    }

    /**
     * 根据用户 ID 加载登录主体
     */
    public LoginUser loadById(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        return buildLoginUser(user);
    }

    private LoginUser buildLoginUser(SysUser user) {
        List<SysRole> roleList = sysRoleMapper.selectRolesByUserId(user.getId());
        Set<String> roles = roleList.stream()
                .map(SysRole::getRoleCode)
                .collect(Collectors.toCollection(HashSet::new));
        List<SysPermission> permissionList = sysPermissionMapper.selectPermissionsByUserId(user.getId());
        Set<String> permissions = permissionList.stream()
                .map(SysPermission::getPermissionCode)
                .collect(Collectors.toCollection(HashSet::new));
        return new LoginUser(user, roles, permissions);
    }
}
