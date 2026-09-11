package com.itsm.smartitsm.module.ticket.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.ticket.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单 Mapper
 */
@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {
}
