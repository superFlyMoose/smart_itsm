package com.itsm.smartitsm.common.cache;

import com.itsm.smartitsm.common.cache.dto.IdNameCache;
import com.itsm.smartitsm.common.cache.dto.UserBaseCache;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import com.itsm.smartitsm.module.category.mapper.TicketCategoryMapper;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import com.itsm.smartitsm.module.team.mapper.SysTeamMapper;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 引用数据（用户/团队/分类）名称批量解析服务。
 * 缓存未命中的 ID 合并为一次 IN 查询回源并逐条回填，避免 N+1 与缓存击穿。
 */
@Service
@RequiredArgsConstructor
public class ReferenceCacheService {

    private static final Duration USER_TTL = Duration.ofMinutes(60);
    private static final Duration TEAM_TTL = Duration.ofHours(2);
    private static final Duration CATEGORY_TTL = Duration.ofHours(2);

    private final RedisCacheService cache;
    private final SysUserMapper sysUserMapper;
    private final SysTeamMapper sysTeamMapper;
    private final TicketCategoryMapper ticketCategoryMapper;

    /**
     * 批量获取用户真实姓名
     */
    public Map<Long, String> getUserNames(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, String> result = new HashMap<>();
        Map<String, Long> keyToId = new HashMap<>();
        List<String> keys = new ArrayList<>();
        for (Long id : userIds) {
            if (id == null) {
                continue;
            }
            String key = CacheKeys.userBase(id);
            keys.add(key);
            keyToId.put(key, id);
        }
        Map<String, Object> hit = cache.multiGet(keys);
        Set<Long> missIds = new HashSet<>();
        for (String key : keys) {
            Object value = hit.get(key);
            if (value instanceof UserBaseCache user) {
                result.put(user.getId(), user.getRealName());
            } else {
                missIds.add(keyToId.get(key));
            }
        }
        if (!missIds.isEmpty()) {
            List<SysUser> users = sysUserMapper.selectBatchIds(missIds);
            for (SysUser user : users) {
                result.put(user.getId(), user.getRealName());
                cache.set(CacheKeys.userBase(user.getId()),
                        new UserBaseCache(user.getId(), user.getUsername(), user.getRealName()), USER_TTL);
            }
        }
        return result;
    }

    /**
     * 批量获取团队名称
     */
    public Map<Long, String> getTeamNames(Set<Long> teamIds) {
        if (teamIds == null || teamIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, String> result = new HashMap<>();
        Map<String, Long> keyToId = new HashMap<>();
        List<String> keys = new ArrayList<>();
        for (Long id : teamIds) {
            if (id == null) {
                continue;
            }
            String key = CacheKeys.teamBase(id);
            keys.add(key);
            keyToId.put(key, id);
        }
        Map<String, Object> hit = cache.multiGet(keys);
        Set<Long> missIds = new HashSet<>();
        for (String key : keys) {
            Object value = hit.get(key);
            if (value instanceof IdNameCache item) {
                result.put(item.getId(), item.getName());
            } else {
                missIds.add(keyToId.get(key));
            }
        }
        if (!missIds.isEmpty()) {
            Collection<SysTeam> teams = sysTeamMapper.selectBatchIds(missIds);
            for (SysTeam team : teams) {
                result.put(team.getId(), team.getName());
                cache.set(CacheKeys.teamBase(team.getId()),
                        new IdNameCache(team.getId(), team.getName()), TEAM_TTL);
            }
        }
        return result;
    }

    /**
     * 批量获取分类名称
     */
    public Map<Long, String> getCategoryNames(Set<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, String> result = new HashMap<>();
        Map<String, Long> keyToId = new HashMap<>();
        List<String> keys = new ArrayList<>();
        for (Long id : categoryIds) {
            if (id == null) {
                continue;
            }
            String key = CacheKeys.categoryBase(id);
            keys.add(key);
            keyToId.put(key, id);
        }
        Map<String, Object> hit = cache.multiGet(keys);
        Set<Long> missIds = new HashSet<>();
        for (String key : keys) {
            Object value = hit.get(key);
            if (value instanceof IdNameCache item) {
                result.put(item.getId(), item.getName());
            } else {
                missIds.add(keyToId.get(key));
            }
        }
        if (!missIds.isEmpty()) {
            List<TicketCategory> categories = ticketCategoryMapper.selectBatchIds(missIds);
            for (TicketCategory category : categories) {
                result.put(category.getId(), category.getName());
                cache.set(CacheKeys.categoryBase(category.getId()),
                        new IdNameCache(category.getId(), category.getName()), CATEGORY_TTL);
            }
        }
        return result;
    }
}
