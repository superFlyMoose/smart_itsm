package com.itsm.smartitsm.module.ai.mq;

import com.itsm.smartitsm.module.ai.processor.AiTaskProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * AI 任务消费者：接收任务ID消息并异步执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiTaskConsumer {

    private final AiTaskProcessor aiTaskProcessor;

    @RabbitListener(queues = "${smart-itsm.rabbitmq.ai-queue:smart.itsm.ai.task.queue}")
    public void consume(Long taskId) {
        log.info("收到AI任务消息，taskId={}", taskId);
        aiTaskProcessor.process(taskId);
    }
}
