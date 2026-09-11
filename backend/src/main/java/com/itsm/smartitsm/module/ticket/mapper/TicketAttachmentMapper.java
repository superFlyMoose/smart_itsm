package com.itsm.smartitsm.module.ticket.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.ticket.entity.TicketAttachment;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单附件 Mapper
 */
@Mapper
public interface TicketAttachmentMapper extends BaseMapper<TicketAttachment> {
}
