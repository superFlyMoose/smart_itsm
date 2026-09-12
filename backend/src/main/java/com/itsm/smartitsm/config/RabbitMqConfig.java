package com.itsm.smartitsm.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ 配置：声明交换机、通知队列与 AI 任务队列
 */
@Configuration
public class RabbitMqConfig {

    @Value("${smart-itsm.rabbitmq.exchange:smart.itsm.exchange}")
    private String exchangeName;

    @Value("${smart-itsm.rabbitmq.ai-queue:smart.itsm.ai.task.queue}")
    private String aiQueueName;

    @Value("${smart-itsm.rabbitmq.ai-routing-key:ai.task}")
    private String aiRoutingKey;

    @Value("${smart-itsm.rabbitmq.notification-queue:smart.itsm.notification.queue}")
    private String notificationQueueName;

    @Value("${smart-itsm.rabbitmq.notification-routing-key:notification}")
    private String notificationRoutingKey;

    @Bean
    public DirectExchange smartItsmExchange() {
        return new DirectExchange(exchangeName, true, false);
    }

    @Bean
    public Queue aiTaskQueue() {
        return new Queue(aiQueueName, true);
    }

    @Bean
    public Binding aiTaskBinding(Queue aiTaskQueue, DirectExchange smartItsmExchange) {
        return BindingBuilder.bind(aiTaskQueue)
                .to(smartItsmExchange)
                .with(aiRoutingKey);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(notificationQueueName, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange smartItsmExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(smartItsmExchange)
                .with(notificationRoutingKey);
    }

    /**
     * 消息转换器；放开信任包限制，消费端可按 __TypeId__ 反序列化为业务消息类型
     */
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter("*");
    }
}
