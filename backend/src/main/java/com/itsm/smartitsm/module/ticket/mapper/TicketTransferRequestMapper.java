package com.itsm.smartitsm.module.ticket.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.ticket.entity.TicketTransferRequest;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单跨团队转派申请 Mapper
 */
@Mapper
public interface TicketTransferRequestMapper extends BaseMapper<TicketTransferRequest> {
}
