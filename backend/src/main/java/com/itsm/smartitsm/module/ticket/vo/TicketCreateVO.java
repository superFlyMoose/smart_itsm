package com.itsm.smartitsm.module.ticket.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建工单返回 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateVO {

    private Long id;
    private String ticketNo;
    private String status;
    private String statusName;
}
