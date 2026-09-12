package com.itsm.smartitsm.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.common.cache.CacheKeys;
import com.itsm.smartitsm.common.cache.RedisCacheService;
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

import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户认证信息加载服务。
 * JWT 过滤器热路径（每个请求）走 Redis 鉴权快照缓存；登录密码校验路径直接查库。
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /** 鉴权快照 TTL：30 分钟 */
    private static final Duration AUTH_SNAPSHOT_TTL = Duration.ofMinutes(30);

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysPermissionMapper sysPermissionMapper;
    private final RedisCacheService cache;

    /**
     * 登录认证使用：必须查库获取最新密码哈希与账号状态，不走缓存
     */
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
     * JWT 过滤器热路径：优先读 Redis 鉴权快照，未命中再查库（用户 + 角色 + 权限 3 条 SQL）
     */
    public LoginUser loadById(Long userId) {
        // 版本号不存在时默认 0，首次 INCR 即为 1，保证第一次权限调整就能使旧快照失效
        long version = cache.getLong(CacheKeys.AUTH_VERSION, 0L);
        String key = CacheKeys.authUser(version, userId);
        LoginUserSnapshot snapshot = cache.get(key);
        if (snapshot != null && snapshot.getUser() != null) {
            return new LoginUser(snapshot.getUser(), snapshot.getRoles(), snapshot.getPermissions());
        }

        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        LoginUser loginUser = buildLoginUser(user);
        cacheSnapshot(version, userId, loginUser);
        return loginUser;
    }

    private void cacheSnapshot(long version, Long userId, LoginUser loginUser) {
        SysUser cachedUser = loginUser.getUser();
        // 不缓存密码哈希
        cachedUser.setPassword(null);
        LoginUserSnapshot snapshot = new LoginUserSnapshot(
                cachedUser, loginUser.getRoles(), loginUser.getPermissions());
        cache.set(CacheKeys.authUser(version, userId), snapshot, AUTH_SNAPSHOT_TTL);
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
        // ADMIN 角色拥有全部权限，确保 @PreAuthorize 层能放行，与 Service 层 hasRole("ADMIN") 判断保持一致
        if (roles.contains("ADMIN")) {
            List<SysPermission> allPermissions = sysPermissionMapper.selectList(null);
            permissions = allPermissions.stream()
                    .map(SysPermission::getPermissionCode)
                    .collect(Collectors.toCollection(HashSet::new));
        }
        return new LoginUser(user, roles, permissions);
    }

    /**
     * 失效单个用户的鉴权快照（用户信息/状态/角色分配变更后调用）
     */
    public void evictUser(Long userId) {
        long version = cache.getLong(CacheKeys.AUTH_VERSION, 0L);
        cache.delete(CacheKeys.authUser(version, userId));
    }

    /**
     * 全局鉴权版本递增（角色-权限关系变更后调用），使全部用户快照随旧版本自然过期
     */
    public void bumpAuthVersion() {
        cache.increment(CacheKeys.AUTH_VERSION);
    }
}
