package com.itsm.smartitsm.module.sla.dto;

import lombok.Data;

/**
 * 工单SLA分页查询条件（团队 SLA 查询）
 */
@Data
public class SlaTicketQueryDTO {

    /** 优先级：URGENT/HIGH/MEDIUM/LOW */
    private String priority;
    /** 是否响应超时 */
    private Boolean responseBreached;
    /** 是否解决超时 */
    private Boolean resolveBreached;
    private Long teamId;
    private String startTime;
    private String endTime;
    private Integer pageNum;
    private Integer pageSize;
}
