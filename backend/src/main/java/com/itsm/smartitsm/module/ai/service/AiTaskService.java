package com.itsm.smartitsm.module.ai.service;

import com.itsm.smartitsm.module.ai.dto.AiTaskCreateDTO;
import com.itsm.smartitsm.module.ai.vo.AiTaskCreateVO;
import com.itsm.smartitsm.module.ai.vo.AiTaskVO;

/**
 * AI 任务服务。AI 模块不直接修改核心业务状态，
 * 仅创建异步任务记录，由消息队列消费者驱动状态流转
 */
public interface AiTaskService {

    /**
     * 创建 AI 任务（初始 PENDING）
     */
    AiTaskCreateVO createTask(AiTaskCreateDTO dto);

    /**
     * 查询 AI 任务详情
     */
    AiTaskVO getTask(Long taskId);
}
