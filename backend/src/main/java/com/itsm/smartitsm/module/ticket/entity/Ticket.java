package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * IT服务工单主表 ticket
 */
@Data
@TableName("ticket")
public class Ticket {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单编号 */
    private String ticketNo;

    /** 工单标题 */
    private String title;

    /** 问题描述 */
    private String description;

    /** 创建人ID */
    private Long creatorId;

    /** 创建人部门ID */
    private Long departmentId;

    /** 当前负责团队ID */
    private Long teamId;

    /** 当前处理人ID */
    private Long assigneeId;

    /** 工单分类ID */
    private Long categoryId;

    /** 优先级：URGENT/HIGH/MEDIUM/LOW */
    private String priority;

    /** 状态：OPEN/ASSIGNED/PROCESSING/WAITING_COLLABORATION/WAITING_CONFIRM/CLOSED/CANCELLED */
    private String status;

    /** 提交时客户端IP */
    private String clientIp;

    /** 首次响应时间 */
    private LocalDateTime firstResponseAt;

    /** 解决时间（工程师提交解决方案时间） */
    private LocalDateTime resolvedAt;

    /** 关闭时间 */
    private LocalDateTime closedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
