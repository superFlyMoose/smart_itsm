package com.itsm.smartitsm.module.ticket.dto;

import lombok.Data;

/**
 * 工单分页查询条件
 */
@Data
public class TicketQueryDTO {

    private String ticketNo;
    private String title;
    /** 状态编码 */
    private String status;
    /** 优先级编码 */
    private String priority;
    private Long categoryId;
    private Long teamId;
    private Long assigneeId;
    private Long creatorId;
    private Long departmentId;
    /** 创建时间起 yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss */
    private String startTime;
    /** 创建时间止 */
    private String endTime;
    private Integer pageNum;
    private Integer pageSize;
}
