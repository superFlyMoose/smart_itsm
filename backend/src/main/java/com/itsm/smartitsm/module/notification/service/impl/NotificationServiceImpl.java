package com.itsm.smartitsm.module.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.enums.NotificationTypeEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.module.notification.entity.Notification;
import com.itsm.smartitsm.module.notification.mapper.NotificationMapper;
import com.itsm.smartitsm.module.notification.service.NotificationService;
import com.itsm.smartitsm.module.notification.vo.NotificationVO;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 通知服务实现
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final String RELATED_TYPE_TICKET = "TICKET";

    private final NotificationMapper notificationMapper;

    @Override
    public void create(Long userId, NotificationTypeEnum type, String title, String content,
                       String relatedType, Long relatedId) {
        if (userId == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type.name());
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedType(relatedType);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0);
        notificationMapper.insert(notification);
    }

    @Override
    public PageResult<NotificationVO> pageNotifications(Boolean isRead, Integer pageNum, Integer pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(isRead != null, Notification::getIsRead, Boolean.TRUE.equals(isRead) ? 1 : 0)
                .orderByDesc(Notification::getId);
        Page<Notification> page = notificationMapper.selectPage(PageUtil.build(pageNum, pageSize), wrapper);
        List<NotificationVO> voList = page.getRecords().stream().map(this::toVO).toList();
        return PageResult.of(page, voList);
    }

    @Override
    public Long unreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationMapper.selectCount(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0));
    }

    @Override
    public void markRead(Long notificationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationMapper.selectById(notificationId);
        if (notification == null || !userId.equals(notification.getUserId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "通知不存在");
        }
        notification.setIsRead(1);
        notificationMapper.updateById(notification);
    }

    @Override
    public void readAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)
                .set(Notification::getIsRead, 1));
    }

    private NotificationVO toVO(Notification notification) {
        NotificationVO vo = new NotificationVO();
        vo.setId(notification.getId());
        vo.setType(notification.getType());
        vo.setTitle(notification.getTitle());
        vo.setContent(notification.getContent());
        vo.setRelatedType(notification.getRelatedType() != null ? notification.getRelatedType()
                : RELATED_TYPE_TICKET);
        vo.setRelatedId(notification.getRelatedId());
        vo.setIsRead(notification.getIsRead() != null && notification.getIsRead() == 1);
        vo.setCreatedAt(notification.getCreatedAt());
        return vo;
    }
}
