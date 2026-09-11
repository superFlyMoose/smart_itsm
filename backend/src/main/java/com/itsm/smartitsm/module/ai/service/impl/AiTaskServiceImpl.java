package com.itsm.smartitsm.module.ai.service.impl;

import com.itsm.smartitsm.common.enums.AiTaskStatusEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.module.ai.dto.AiTaskCreateDTO;
import com.itsm.smartitsm.module.ai.entity.AiTask;
import com.itsm.smartitsm.module.ai.mapper.AiTaskMapper;
import com.itsm.smartitsm.module.ai.processor.AiTaskProcessor;
import com.itsm.smartitsm.module.ai.service.AiTaskService;
import com.itsm.smartitsm.module.ai.vo.AiTaskCreateVO;
import com.itsm.smartitsm.module.ai.vo.AiTaskVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * AI 任务服务实现
 *
 * <p>创建任务后通过 RabbitMQ 投递消息异步执行；
 * 当消息代理不可用时，降级为进程内 @Async 执行，保证接口可用。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiTaskServiceImpl implements AiTaskService {

    private final AiTaskMapper aiTaskMapper;
    private final RabbitTemplate rabbitTemplate;
    private final AiTaskProcessor aiTaskProcessor;

    @Value("${smart-itsm.rabbitmq.exchange:smart.itsm.exchange}")
    private String exchangeName;

    @Value("${smart-itsm.rabbitmq.ai-routing-key:ai.task}")
    private String aiRoutingKey;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AiTaskCreateVO createTask(AiTaskCreateDTO dto) {
        AiTask task = new AiTask();
        task.setTaskType(dto.getTaskType().name());
        task.setBusinessType(dto.getBusinessType());
        task.setBusinessId(dto.getBusinessId());
        task.setStatus(AiTaskStatusEnum.PENDING.name());
        aiTaskMapper.insert(task);

        // 事务提交后再投递，避免消费者/异步线程在提交前查不到 PENDING 任务
        Long taskId = task.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatch(taskId);
                }
            });
        } else {
            dispatch(taskId);
        }
        return new AiTaskCreateVO(task.getId(), task.getTaskType(), task.getStatus());
    }

    /**
     * 投递 AI 任务到消息队列；Broker 不可用时降级为本地异步线程执行
     */
    private void dispatch(Long taskId) {
        try {
            rabbitTemplate.convertAndSend(exchangeName, aiRoutingKey, taskId);
        } catch (AmqpException e) {
            log.warn("RabbitMQ不可用，AI任务降级为本地异步执行，taskId={}, reason={}", taskId, e.getMessage());
            aiTaskProcessor.process(taskId);
        }
    }

    @Override
    public AiTaskVO getTask(Long taskId) {
        AiTask task = aiTaskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.AI_TASK_NOT_FOUND);
        }
        AiTaskVO vo = new AiTaskVO();
        vo.setId(task.getId());
        vo.setTaskType(task.getTaskType());
        vo.setBusinessType(task.getBusinessType());
        vo.setBusinessId(task.getBusinessId());
        vo.setStatus(task.getStatus());
        vo.setStatusName(resolveStatusName(task.getStatus()));
        vo.setOutput(task.getOutput());
        vo.setErrorMessage(task.getErrorMessage());
        vo.setStartedAt(task.getStartedAt());
        vo.setCompletedAt(task.getCompletedAt());
        vo.setCreatedAt(task.getCreatedAt());
        return vo;
    }

    private String resolveStatusName(String status) {
        try {
            return AiTaskStatusEnum.valueOf(status).getStatusName();
        } catch (IllegalArgumentException e) {
            return status;
        }
    }
}
