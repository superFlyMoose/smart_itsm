package com.itsm.smartitsm.module.ticket.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单附件表 ticket_attachment
 */
@Data
@TableName("ticket_attachment")
public class TicketAttachment {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long ticketId;

    /** 上传人ID */
    private Long uploaderId;

    /** 文件名称 */
    private String fileName;

    /** 文件地址 */
    private String fileUrl;

    /** 文件大小（字节） */
    private Long fileSize;

    /** 文件类型 */
    private String contentType;

    private LocalDateTime createdAt;
}
