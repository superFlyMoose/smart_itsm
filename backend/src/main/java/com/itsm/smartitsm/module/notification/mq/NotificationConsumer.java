package com.itsm.smartitsm.module.notification.mq;

import com.itsm.smartitsm.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * 通知消费者：监听通知队列，将通知落库并失效未读数缓存
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "${smart-itsm.rabbitmq.notification-queue:smart.itsm.notification.queue}")
    public void onMessage(NotificationMessage message) {
        try {
            notificationService.create(message.userId(), message.type(), message.title(),
                    message.content(), message.relatedType(), message.relatedId());
        } catch (Exception e) {
            // default-requeue-rejected=false，吞掉异常避免无限重投
            log.error("处理通知消息失败: {}", message, e);
        }
    }
}
