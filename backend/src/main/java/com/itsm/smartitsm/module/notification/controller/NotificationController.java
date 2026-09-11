package com.itsm.smartitsm.module.notification.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.notification.service.NotificationService;
import com.itsm.smartitsm.module.notification.vo.NotificationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 通知接口
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 分页查询当前用户通知
     */
    @GetMapping
    public Result<PageResult<NotificationVO>> page(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {
        return Result.success(notificationService.pageNotifications(isRead, pageNum, pageSize));
    }

    /**
     * 查询未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Long>> unreadCount() {
        return Result.success(Map.of("count", notificationService.unreadCount()));
    }

    /**
     * 标记单条通知为已读
     */
    @PostMapping("/{notificationId}/read")
    public Result<Void> markRead(@PathVariable Long notificationId) {
        notificationService.markRead(notificationId);
        return Result.success();
    }

    /**
     * 全部通知标记为已读
     */
    @PostMapping("/read-all")
    public Result<Void> readAll() {
        notificationService.readAll();
        return Result.success();
    }
}
