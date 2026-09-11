package com.itsm.smartitsm.module.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI任务记录表 ai_task
 */
@Data
@TableName("ai_task")
public class AiTask {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** AI任务类型 */
    private String taskType;

    /** 业务类型 */
    private String businessType;

    /** 业务ID */
    private Long businessId;

    /** 状态：PENDING/RUNNING/SUCCESS/FAILED */
    private String status;

    /** AI输入 */
    private String input;

    /** AI输出 */
    private String output;

    /** 错误信息 */
    private String errorMessage;

    /** 开始时间 */
    private LocalDateTime startedAt;

    /** 完成时间 */
    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
}
