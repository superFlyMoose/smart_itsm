package com.itsm.smartitsm.module.category.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工单分类 Mapper
 */
@Mapper
public interface TicketCategoryMapper extends BaseMapper<TicketCategory> {
}
