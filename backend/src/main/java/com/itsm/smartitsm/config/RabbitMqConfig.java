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
 * RabbitMQ 配置：声明交换机与 AI 任务队列
 */
@Configuration
public class RabbitMqConfig {

    @Value("${smart-itsm.rabbitmq.exchange:smart.itsm.exchange}")
    private String exchangeName;

    @Value("${smart-itsm.rabbitmq.ai-queue:smart.itsm.ai.task.queue}")
    private String aiQueueName;

    @Value("${smart-itsm.rabbitmq.ai-routing-key:ai.task}")
    private String aiRoutingKey;

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
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
