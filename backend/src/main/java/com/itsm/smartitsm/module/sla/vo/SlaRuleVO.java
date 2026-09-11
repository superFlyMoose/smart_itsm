package com.itsm.smartitsm.module.sla.vo;

import lombok.Data;

/**
 * SLA规则 VO
 */
@Data
public class SlaRuleVO {

    private Long id;
    private String name;
    private String priority;
    private Integer responseMinutes;
    private Integer resolveMinutes;
    private Integer escalationMinutes;
    /** 状态：1启用 0禁用 */
    private Integer status;
}
