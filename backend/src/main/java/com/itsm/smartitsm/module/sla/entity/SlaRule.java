package com.itsm.smartitsm.module.sla.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * SLA规则表 sla_rule
 */
@Data
@TableName("sla_rule")
public class SlaRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 规则名称 */
    private String name;

    /** 对应优先级 */
    private String priority;

    /** 首次响应时限（分钟） */
    private Integer responseMinutes;

    /** 解决时限（分钟） */
    private Integer resolveMinutes;

    /** 升级时限（分钟） */
    private Integer escalationMinutes;

    /** 状态：1启用 0禁用 */
    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
