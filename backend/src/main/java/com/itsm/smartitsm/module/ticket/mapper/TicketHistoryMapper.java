package com.itsm.smartitsm.module.ticket.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.ticket.entity.TicketHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单操作历史 Mapper
 */
@Mapper
public interface TicketHistoryMapper extends BaseMapper<TicketHistory> {
}
