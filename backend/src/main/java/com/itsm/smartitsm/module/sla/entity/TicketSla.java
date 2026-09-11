package com.itsm.smartitsm.module.sla.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单SLA实例表 ticket_sla
 */
@Data
@TableName("ticket_sla")
public class TicketSla {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** SLA规则ID */
    private Long ruleId;

    /** 响应截止时间 */
    private LocalDateTime responseDeadline;

    /** 解决截止时间 */
    private LocalDateTime resolveDeadline;

    /** 实际首次响应时间 */
    private LocalDateTime firstResponseAt;

    /** 实际解决时间 */
    private LocalDateTime resolvedAt;

    /** 是否响应超时：1是 0否 */
    private Integer responseBreached;

    /** 是否解决超时：1是 0否 */
    private Integer resolveBreached;

    private LocalDateTime createdAt;
}
