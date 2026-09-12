package com.itsm.smartitsm.module.notification.mq;

import com.itsm.smartitsm.common.enums.NotificationTypeEnum;

/**
 * 通知消息体：业务方发布到 MQ，由通知消费者异步落库
 */
public record NotificationMessage(
        Long userId,
        NotificationTypeEnum type,
        String title,
        String content,
        String relatedType,
        Long relatedId
) {
}
