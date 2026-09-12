package com.itsm.smartitsm.common.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Redis 缓存操作统一入口。
 * 所有操作均做容错处理：Redis 异常时降级（读返回 null 走数据库，写仅记日志），不影响主业务。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private static final long SCAN_BATCH_SIZE = 200;

    private final RedisTemplate<String, Object> redisTemplate;

    /** 读取缓存，异常或不存在返回 null */
    public <T> T get(String key) {
        try {
            @SuppressWarnings("unchecked")
            T value = (T) redisTemplate.opsForValue().get(key);
            return value;
        } catch (Exception e) {
            log.warn("Redis 读取缓存失败 key={}, 降级查库: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 批量读取，返回 key -> value 映射（仅包含命中的 key）。
     * 调用方需保证 keys 与业务标识的映射自行维护。
     */
    public Map<String, Object> multiGet(Collection<String> keys) {
        if (keys == null || keys.isEmpty()) {
            return Map.of();
        }
        try {
            List<Object> values = redisTemplate.opsForValue().multiGet(keys);
            if (values == null) {
                return Map.of();
            }
            Map<String, Object> result = new HashMap<>();
            int i = 0;
            for (String key : keys) {
                Object value = values.get(i++);
                if (value != null) {
                    result.put(key, value);
                }
            }
            return result;
        } catch (Exception e) {
            log.warn("Redis 批量读取缓存失败, 降级查库: {}", e.getMessage());
            return Map.of();
        }
    }

    /** 写入缓存（带 TTL），失败仅记日志 */
    public void set(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (Exception e) {
            log.warn("Redis 写入缓存失败 key={}: {}", key, e.getMessage());
        }
    }

    /** 删除缓存，失败仅记日志 */
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis 删除缓存失败 key={}: {}", key, e.getMessage());
        }
    }

    /** 批量删除缓存 */
    public void delete(Collection<String> keys) {
        if (keys == null || keys.isEmpty()) {
            return;
        }
        try {
            redisTemplate.delete(keys);
        } catch (Exception e) {
            log.warn("Redis 批量删除缓存失败: {}", e.getMessage());
        }
    }

    /**
     * 按前缀扫描删除（SCAN 游标，不阻塞 Redis）。
     * 仅用于数据量小、低频的管理操作（如团队/分类配置变更）。
     */
    public void deleteByPrefix(String prefix) {
        try {
            ScanOptions options = ScanOptions.scanOptions()
                    .match(prefix + "*")
                    .count(SCAN_BATCH_SIZE)
                    .build();
            List<byte[]> rawKeys = new ArrayList<>();
            redisTemplate.execute((RedisCallback<Void>) connection -> {
                try (Cursor<byte[]> cursor = connection.scan(options)) {
                    while (cursor.hasNext()) {
                        rawKeys.add(cursor.next());
                        if (rawKeys.size() >= SCAN_BATCH_SIZE) {
                            connection.keyCommands().del(rawKeys.toArray(new byte[0][]));
                            rawKeys.clear();
                        }
                    }
                }
                if (!rawKeys.isEmpty()) {
                    connection.keyCommands().del(rawKeys.toArray(new byte[0][]));
                }
                return null;
            });
        } catch (Exception e) {
            log.warn("Redis 前缀删除缓存失败 prefix={}: {}", prefix, e.getMessage());
        }
    }

    /** 读取 long 计数，不存在返回 defaultValue */
    public long getLong(String key, long defaultValue) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return defaultValue;
            }
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            log.warn("Redis 读取计数失败 key={}: {}", key, e.getMessage());
            return defaultValue;
        }
    }

    /** 递增并返回新值，异常返回 defaultValue（调用方据此降级） */
    public long increment(String key) {
        try {
            Long value = redisTemplate.opsForValue().increment(key);
            return value != null ? value : 1L;
        } catch (Exception e) {
            log.warn("Redis 递增失败 key={}: {}", key, e.getMessage());
            return 1L;
        }
    }
}
