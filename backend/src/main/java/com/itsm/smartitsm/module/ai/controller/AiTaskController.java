package com.itsm.smartitsm.module.ai.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.ai.dto.AiTaskCreateDTO;
import com.itsm.smartitsm.module.ai.service.AiTaskService;
import com.itsm.smartitsm.module.ai.vo.AiTaskCreateVO;
import com.itsm.smartitsm.module.ai.vo.AiTaskVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI 任务接口
 */
@RestController
@RequestMapping("/api/v1/ai/tasks")
@RequiredArgsConstructor
public class AiTaskController {

    private final AiTaskService aiTaskService;

    /**
     * 创建 AI 任务
     */
    @PostMapping
    public Result<AiTaskCreateVO> create(@Valid @RequestBody AiTaskCreateDTO dto) {
        return Result.success(aiTaskService.createTask(dto));
    }

    /**
     * 查询 AI 任务详情
     */
    @GetMapping("/{taskId}")
    public Result<AiTaskVO> detail(@PathVariable Long taskId) {
        return Result.success(aiTaskService.getTask(taskId));
    }
}
