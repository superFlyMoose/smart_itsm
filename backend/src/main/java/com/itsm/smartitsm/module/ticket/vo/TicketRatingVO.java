package com.itsm.smartitsm.module.ticket.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单评价 VO
 */
@Data
public class TicketRatingVO {

    private Long id;
    private Long ticketId;
    private SimpleUserVO user;
    private Integer score;
    private String comment;
    private LocalDateTime createdAt;
}
