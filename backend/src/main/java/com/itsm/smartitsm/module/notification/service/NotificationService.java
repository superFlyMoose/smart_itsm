package com.itsm.smartitsm.module.notification.service;

import com.itsm.smartitsm.common.enums.NotificationTypeEnum;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.module.notification.vo.NotificationVO;

/**
 * 通知服务
 */
public interface NotificationService {

    /**
     * 创建通知
     *
     * @param userId      接收用户ID
     * @param type        通知类型
     * @param title       通知标题
     * @param content     通知内容
     * @param relatedType 关联业务类型
     * @param relatedId   关联业务ID
     */
    void create(Long userId, NotificationTypeEnum type, String title, String content,
                String relatedType, Long relatedId);

    /**
     * 分页查询当前用户通知
     */
    PageResult<NotificationVO> pageNotifications(Boolean isRead, Integer pageNum, Integer pageSize);

    /**
     * 查询当前用户未读通知数量
     */
    Long unreadCount();

    /**
     * 标记单条通知为已读
     */
    void markRead(Long notificationId);

    /**
     * 当前用户通知全部标记为已读
     */
    void readAll();
}
