package com.itsm.smartitsm.module.notification.mq;

import com.itsm.smartitsm.common.enums.NotificationTypeEnum;
import com.itsm.smartitsm.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 通知发布器：业务方统一入口，通知经 RabbitMQ 异步落库，与业务主流程解耦；
 * MQ 不可用时降级为同步写入，保证通知不丢失
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final NotificationService notificationService;

    @Value("${smart-itsm.rabbitmq.exchange:smart.itsm.exchange}")
    private String exchangeName;

    @Value("${smart-itsm.rabbitmq.notification-routing-key:notification}")
    private String routingKey;

    public void publish(Long userId, NotificationTypeEnum type, String title, String content,
                        String relatedType, Long relatedId) {
        try {
            rabbitTemplate.convertAndSend(exchangeName, routingKey,
                    new NotificationMessage(userId, type, title, content, relatedType, relatedId));
        } catch (Exception e) {
            log.warn("RabbitMQ 发送通知失败, 降级为同步写入: {}", e.getMessage());
            notificationService.create(userId, type, title, content, relatedType, relatedId);
        }
    }
}
