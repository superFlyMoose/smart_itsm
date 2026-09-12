package com.itsm.smartitsm.common.cache;

/**
 * Redis 缓存 key 统一定义，命名规范：业务域:实体:维度
 */
public final class CacheKeys {

    private CacheKeys() {
    }

    /** 鉴权快照全局版本号，角色-权限关系变更时递增，使旧版本快照整体失效 */
    public static final String AUTH_VERSION = "auth:ver";

    /** 鉴权快照（含用户状态、角色、权限），按版本号隔离 */
    public static String authUser(long version, Long userId) {
        return "auth:user:v" + version + ":" + userId;
    }

    /** 用户简要信息：id / username / realName */
    public static String userBase(Long userId) {
        return "user:base:" + userId;
    }

    /** 团队简要信息：id / name */
    public static String teamBase(Long teamId) {
        return "team:base:" + teamId;
    }

    public static final String TEAM_BASE_PREFIX = "team:base:";

    /** 分类简要信息：id / name */
    public static String categoryBase(Long categoryId) {
        return "category:base:" + categoryId;
    }

    public static final String CATEGORY_BASE_PREFIX = "category:base:";

    /** 启用分类整棵树 */
    public static final String CATEGORY_TREE = "category:tree";

    /** 启用部门整棵树 */
    public static final String DEPARTMENT_TREE = "department:tree";

    /** 按优先级的启用 SLA 规则 */
    public static String slaRuleByPriority(String priority) {
        return "sla:rule:priority:" + priority;
    }

    public static final String SLA_RULE_PREFIX = "sla:rule:";

    /** 用户通知未读数 */
    public static String notificationUnread(Long userId) {
        return "notification:unread:" + userId;
    }
}
