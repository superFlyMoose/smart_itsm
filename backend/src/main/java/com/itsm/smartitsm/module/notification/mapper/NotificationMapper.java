package com.itsm.smartitsm.module.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

/**
 * 系统通知 Mapper
 */
@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
}
