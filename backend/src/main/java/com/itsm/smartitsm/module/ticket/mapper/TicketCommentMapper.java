package com.itsm.smartitsm.module.ticket.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.ticket.entity.TicketComment;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单评论 Mapper
 */
@Mapper
public interface TicketCommentMapper extends BaseMapper<TicketComment> {
}
