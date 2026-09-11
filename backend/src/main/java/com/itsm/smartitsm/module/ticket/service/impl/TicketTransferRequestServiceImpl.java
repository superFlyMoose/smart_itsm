package com.itsm.smartitsm.module.ticket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.enums.NotificationTypeEnum;
import com.itsm.smartitsm.common.enums.TicketActionEnum;
import com.itsm.smartitsm.common.enums.TicketStatusEnum;
import com.itsm.smartitsm.common.enums.TransferRequestStatusEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.module.notification.service.NotificationService;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import com.itsm.smartitsm.module.team.mapper.SysTeamMapper;
import com.itsm.smartitsm.module.ticket.dto.TicketTransferRequestAuditDTO;
import com.itsm.smartitsm.module.ticket.entity.Ticket;
import com.itsm.smartitsm.module.ticket.entity.TicketHistory;
import com.itsm.smartitsm.module.ticket.entity.TicketTransferRequest;
import com.itsm.smartitsm.module.ticket.mapper.TicketHistoryMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketTransferRequestMapper;
import com.itsm.smartitsm.module.ticket.service.TicketTransferRequestService;
import com.itsm.smartitsm.module.ticket.statemachine.TicketStateMachine;
import com.itsm.smartitsm.module.ticket.vo.SimpleRefVO;
import com.itsm.smartitsm.module.ticket.vo.SimpleUserVO;
import com.itsm.smartitsm.module.ticket.vo.TicketTransferRequestVO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 工单跨团队转派申请服务实现
 * <p>
 * 转派申请状态流转：PENDING -&gt; APPROVED/REJECTED/CANCELLED。
 * 审批通过时由本服务直接执行工单转移（状态机校验 + 乐观更新），
 * 避免与 {@link TicketServiceImpl} 形成循环依赖。
 */
@Service
@RequiredArgsConstructor
public class TicketTransferRequestServiceImpl implements TicketTransferRequestService {

    private static final String RELATED_TYPE_TICKET = "TICKET";
    private static final String RELATED_TYPE_TRANSFER_REQUEST = "TRANSFER_REQUEST";
    private static final int REMARK_MAX_LENGTH = 500;

    private final TicketTransferRequestMapper ticketTransferRequestMapper;
    private final TicketMapper ticketMapper;
    private final TicketHistoryMapper ticketHistoryMapper;
    private final SysTeamMapper sysTeamMapper;
    private final SysUserMapper sysUserMapper;
    private final TicketStateMachine ticketStateMachine;
    private final NotificationService notificationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createRequest(Long ticketId, Long targetTeamId, Long targetAssigneeId, String reason) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);

        if (ticket.getTeamId() == null) {
            throw new BusinessException(ResultCode.TICKET_TRANSFER_FAILED, "工单未分配团队，无法发起跨团队转派");
        }
        if (ticket.getTeamId().equals(targetTeamId)) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_TICKET_TEAM_SAME);
        }

        validateTeamAndEngineer(targetTeamId, targetAssigneeId);

        Long existingPending = ticketTransferRequestMapper.selectCount(
                new LambdaQueryWrapper<TicketTransferRequest>()
                        .eq(TicketTransferRequest::getTicketId, ticketId)
                        .eq(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.PENDING.name()));
        if (existingPending != null && existingPending > 0) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR,
                    "该工单已存在待审批的转派申请");
        }

        TicketTransferRequest request = new TicketTransferRequest();
        request.setTicketId(ticketId);
        request.setRequesterId(loginUser.getUserId());
        request.setFromTeamId(ticket.getTeamId());
        request.setToTeamId(targetTeamId);
        request.setTargetAssigneeId(targetAssigneeId);
        request.setReason(truncate(reason));
        request.setStatus(TransferRequestStatusEnum.PENDING.name());
        ticketTransferRequestMapper.insert(request);

        notifyTargetTeamLeaders(request, ticket,
                NotificationTypeEnum.TRANSFER_REQUEST_RECEIVED,
                "您有新的跨团队转派申请待审批",
                "工单[" + ticket.getTicketNo() + "]" + ticket.getTitle()
                        + " 申请转派至您的团队处理，请及时审批。");

        return request.getId();
    }

    @Override
    public PageResult<TicketTransferRequestVO> pageRequests(String status, Long ticketId,
                                                            Integer pageNum, Integer pageSize) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        LambdaQueryWrapper<TicketTransferRequest> wrapper = new LambdaQueryWrapper<>();
        applyDataScope(wrapper, loginUser);
        wrapper.eq(StringUtils.hasText(status), TicketTransferRequest::getStatus, status)
                .eq(ticketId != null, TicketTransferRequest::getTicketId, ticketId)
                .orderByDesc(TicketTransferRequest::getCreatedAt);

        Page<TicketTransferRequest> page = ticketTransferRequestMapper.selectPage(
                PageUtil.build(pageNum, pageSize), wrapper);

        return PageResult.of(page, buildVOList(page.getRecords()));
    }

    @Override
    public TicketTransferRequestVO getRequestDetail(Long id) {
        TicketTransferRequest request = getRequestOrThrow(id);
        checkViewable(request, SecurityUtils.getLoginUser());
        List<TicketTransferRequestVO> vos = buildVOList(List.of(request));
        return vos.isEmpty() ? null : vos.get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id, TicketTransferRequestAuditDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        TicketTransferRequest request = getRequestOrThrow(id);
        if (!TransferRequestStatusEnum.PENDING.name().equals(request.getStatus())) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }
        checkApprover(request, loginUser);

        Ticket ticket = getTicketOrThrow(request.getTicketId());
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.TRANSFER);
        validateTeamAndEngineer(request.getToTeamId(), request.getTargetAssigneeId());

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticket.getId())
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getTeamId, request.getToTeamId())
                .set(Ticket::getAssigneeId, request.getTargetAssigneeId())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR,
                    "工单状态已变更，审批失败");
        }

        LocalDateTime now = LocalDateTime.now();
        int updated = ticketTransferRequestMapper.update(null,
                new LambdaUpdateWrapper<TicketTransferRequest>()
                        .eq(TicketTransferRequest::getId, id)
                        .eq(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.PENDING.name())
                        .set(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.APPROVED.name())
                        .set(TicketTransferRequest::getApproverId, loginUser.getUserId())
                        .set(TicketTransferRequest::getApproveRemark, truncate(dto.getRemark()))
                        .set(TicketTransferRequest::getApprovedAt, now)
                        .set(TicketTransferRequest::getExecutedAt, now));
        if (updated == 0) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }

        recordHistory(ticket.getId(), loginUser.getUserId(), TicketActionEnum.TRANSFER,
                current.name(), target.name(),
                "跨团队转派审批通过，转派至[" + teamName(request.getToTeamId()) + "]团队");

        notificationService.create(request.getTargetAssigneeId(),
                NotificationTypeEnum.TICKET_TRANSFERRED,
                "您有转派的工单待接受",
                "工单[" + ticket.getTicketNo() + "]" + ticket.getTitle()
                        + " 已转派给您，请及时接受处理。",
                RELATED_TYPE_TICKET, ticket.getId());
        notificationService.create(request.getRequesterId(),
                NotificationTypeEnum.TRANSFER_REQUEST_APPROVED,
                "您的转派申请已通过",
                "工单[" + ticket.getTicketNo() + "] 的跨团队转派申请已审批通过，工单已转移至目标团队。",
                RELATED_TYPE_TRANSFER_REQUEST, id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id, TicketTransferRequestAuditDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        TicketTransferRequest request = getRequestOrThrow(id);
        if (!TransferRequestStatusEnum.PENDING.name().equals(request.getStatus())) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }
        checkApprover(request, loginUser);

        int updated = ticketTransferRequestMapper.update(null,
                new LambdaUpdateWrapper<TicketTransferRequest>()
                        .eq(TicketTransferRequest::getId, id)
                        .eq(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.PENDING.name())
                        .set(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.REJECTED.name())
                        .set(TicketTransferRequest::getApproverId, loginUser.getUserId())
                        .set(TicketTransferRequest::getApproveRemark, truncate(dto.getRemark()))
                        .set(TicketTransferRequest::getApprovedAt, LocalDateTime.now()));
        if (updated == 0) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }

        Ticket ticket = ticketMapper.selectById(request.getTicketId());
        String ticketNo = ticket == null ? "#" + request.getTicketId() : ticket.getTicketNo();
        notificationService.create(request.getRequesterId(),
                NotificationTypeEnum.TRANSFER_REQUEST_REJECTED,
                "您的转派申请被拒绝",
                "工单[" + ticketNo + "] 的跨团队转派申请被目标团队拒绝。"
                        + (StringUtils.hasText(dto.getRemark()) ? "拒绝原因：" + dto.getRemark() : ""),
                RELATED_TYPE_TRANSFER_REQUEST, id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, TicketTransferRequestAuditDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        TicketTransferRequest request = getRequestOrThrow(id);
        if (!TransferRequestStatusEnum.PENDING.name().equals(request.getStatus())) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }
        if (!request.getRequesterId().equals(loginUser.getUserId())
                && !loginUser.hasRole("ADMIN")
                && !loginUser.hasPermission("system:manage")) {
            throw new BusinessException(ResultCode.NOT_TRANSFER_REQUEST_REQUESTER);
        }

        int updated = ticketTransferRequestMapper.update(null,
                new LambdaUpdateWrapper<TicketTransferRequest>()
                        .eq(TicketTransferRequest::getId, id)
                        .eq(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.PENDING.name())
                        .set(TicketTransferRequest::getStatus,
                                TransferRequestStatusEnum.CANCELLED.name())
                        .set(TicketTransferRequest::getApproveRemark, truncate(dto.getRemark())));
        if (updated == 0) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_STATUS_ERROR);
        }

        Ticket ticket = ticketMapper.selectById(request.getTicketId());
        String ticketNo = ticket == null ? "#" + request.getTicketId() : ticket.getTicketNo();
        notifyTargetTeamLeaders(request, ticket,
                NotificationTypeEnum.TRANSFER_REQUEST_CANCELLED,
                "转派申请已撤销",
                "工单[" + ticketNo + "] 的跨团队转派申请已被发起人撤销。");
    }

    // =========================================================
    // 内部辅助方法
    // =========================================================

    private TicketTransferRequest getRequestOrThrow(Long id) {
        TicketTransferRequest request = ticketTransferRequestMapper.selectById(id);
        if (request == null) {
            throw new BusinessException(ResultCode.TRANSFER_REQUEST_NOT_FOUND);
        }
        return request;
    }

    private Ticket getTicketOrThrow(Long ticketId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ResultCode.TICKET_NOT_FOUND);
        }
        return ticket;
    }

    /**
     * 校验目标团队存在且目标工程师属于该团队
     */
    private void validateTeamAndEngineer(Long teamId, Long assigneeId) {
        SysTeam team = sysTeamMapper.selectById(teamId);
        if (team == null || team.getStatus() == null || team.getStatus() != 1) {
            throw new BusinessException(ResultCode.TICKET_TRANSFER_FAILED, "目标团队不存在或已禁用");
        }
        SysUser assignee = sysUserMapper.selectById(assigneeId);
        if (assignee == null || assignee.getStatus() == null || assignee.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND, "目标工程师不存在或已禁用");
        }
        if (sysTeamMapper.countTeamMember(teamId, assigneeId) <= 0) {
            throw new BusinessException(ResultCode.TICKET_TRANSFER_FAILED, "目标工程师不属于该团队");
        }
    }

    /**
     * 列表数据权限过滤：管理员可见全部；否则可见自己发起的或目标团队为本人的申请
     */
    private void applyDataScope(LambdaQueryWrapper<TicketTransferRequest> wrapper, LoginUser loginUser) {
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
        Long userId = loginUser.getUserId();
        List<Long> managedTeamIds = sysTeamMapper.selectManagedTeamIds(userId);
        wrapper.and(w -> {
            w.eq(TicketTransferRequest::getRequesterId, userId);
            if (!managedTeamIds.isEmpty()) {
                w.or().in(TicketTransferRequest::getToTeamId, managedTeamIds);
            }
        });
    }

    /**
     * 详情数据权限校验
     */
    private void checkViewable(TicketTransferRequest request, LoginUser loginUser) {
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
        if (request.getRequesterId().equals(loginUser.getUserId())) {
            return;
        }
        List<Long> managedTeamIds = sysTeamMapper.selectManagedTeamIds(loginUser.getUserId());
        if (request.getToTeamId() != null && managedTeamIds.contains(request.getToTeamId())) {
            return;
        }
        throw new BusinessException(ResultCode.FORBIDDEN, "无权查看该转派申请");
    }

    /**
     * 审批人校验：必须为目标团队负责人或管理员
     */
    private void checkApprover(TicketTransferRequest request, LoginUser loginUser) {
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
        List<Long> managedTeamIds = sysTeamMapper.selectManagedTeamIds(loginUser.getUserId());
        if (request.getToTeamId() == null || !managedTeamIds.contains(request.getToTeamId())) {
            throw new BusinessException(ResultCode.NOT_TRANSFER_REQUEST_APPROVER);
        }
    }

    /**
     * 通知目标团队的负责人（团队 manager_id + LEADER 成员）
     */
    private void notifyTargetTeamLeaders(TicketTransferRequest request, Ticket ticket,
                                         NotificationTypeEnum type, String title, String content) {
        Set<Long> leaderIds = new HashSet<>();
        SysTeam team = sysTeamMapper.selectById(request.getToTeamId());
        if (team != null && team.getManagerId() != null) {
            leaderIds.add(team.getManagerId());
        }
        List<Long> leaders = sysTeamMapper.selectTeamLeaderIds(request.getToTeamId());
        if (leaders != null) {
            leaderIds.addAll(leaders);
        }
        for (Long leaderId : leaderIds) {
            notificationService.create(leaderId, type, title, content,
                    RELATED_TYPE_TRANSFER_REQUEST, request.getId());
        }
    }

    private void recordHistory(Long ticketId, Long operatorId, TicketActionEnum action,
                               String fromStatus, String toStatus, String remark) {
        TicketHistory history = new TicketHistory();
        history.setTicketId(ticketId);
        history.setOperatorId(operatorId);
        history.setAction(action.name());
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setRemark(truncate(remark));
        ticketHistoryMapper.insert(history);
    }

    private List<TicketTransferRequestVO> buildVOList(List<TicketTransferRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        Set<Long> userIds = new HashSet<>();
        Set<Long> teamIds = new HashSet<>();
        Set<Long> ticketIds = new HashSet<>();
        for (TicketTransferRequest r : requests) {
            userIds.add(r.getRequesterId());
            userIds.add(r.getTargetAssigneeId());
            if (r.getApproverId() != null) {
                userIds.add(r.getApproverId());
            }
            teamIds.add(r.getFromTeamId());
            teamIds.add(r.getToTeamId());
            ticketIds.add(r.getTicketId());
        }
        Map<Long, String> userNames = batchLoadUserNames(userIds);
        Map<Long, String> teamNames = batchLoadTeamNames(teamIds);
        Map<Long, Ticket> tickets = batchLoadTickets(ticketIds);

        List<TicketTransferRequestVO> result = new ArrayList<>(requests.size());
        for (TicketTransferRequest r : requests) {
            result.add(toVO(r, userNames, teamNames, tickets));
        }
        return result;
    }

    private TicketTransferRequestVO toVO(TicketTransferRequest r,
                                         Map<Long, String> userNames,
                                         Map<Long, String> teamNames,
                                         Map<Long, Ticket> tickets) {
        TicketTransferRequestVO vo = new TicketTransferRequestVO();
        vo.setId(r.getId());

        Ticket ticket = tickets.get(r.getTicketId());
        vo.setTicketId(r.getTicketId());
        vo.setTicketNo(ticket == null ? null : ticket.getTicketNo());
        vo.setTicketTitle(ticket == null ? null : ticket.getTitle());

        vo.setRequester(new SimpleUserVO(r.getRequesterId(), userNames.get(r.getRequesterId())));
        vo.setFromTeam(new SimpleRefVO(r.getFromTeamId(), teamNames.get(r.getFromTeamId())));
        vo.setToTeam(new SimpleRefVO(r.getToTeamId(), teamNames.get(r.getToTeamId())));
        vo.setTargetAssignee(new SimpleUserVO(r.getTargetAssigneeId(),
                userNames.get(r.getTargetAssigneeId())));
        vo.setReason(r.getReason());
        vo.setStatus(r.getStatus());
        vo.setStatusName(statusName(r.getStatus()));
        if (r.getApproverId() != null) {
            vo.setApprover(new SimpleUserVO(r.getApproverId(), userNames.get(r.getApproverId())));
        }
        vo.setApproveRemark(r.getApproveRemark());
        vo.setApprovedAt(r.getApprovedAt());
        vo.setExecutedAt(r.getExecutedAt());
        vo.setCreatedAt(r.getCreatedAt());
        return vo;
    }

    private String statusName(String status) {
        if (status == null) {
            return null;
        }
        try {
            return TransferRequestStatusEnum.valueOf(status).getStatusName();
        } catch (IllegalArgumentException e) {
            return status;
        }
    }

    private String teamName(Long teamId) {
        if (teamId == null) {
            return "未知";
        }
        SysTeam team = sysTeamMapper.selectById(teamId);
        return team == null ? "未知" : team.getName();
    }

    private Map<Long, String> batchLoadUserNames(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName, (a, b) -> a));
    }

    private Map<Long, String> batchLoadTeamNames(Set<Long> teamIds) {
        if (teamIds == null || teamIds.isEmpty()) {
            return Map.of();
        }
        return sysTeamMapper.selectBatchIds(teamIds).stream()
                .collect(Collectors.toMap(SysTeam::getId, SysTeam::getName, (a, b) -> a));
    }

    private Map<Long, Ticket> batchLoadTickets(Set<Long> ticketIds) {
        if (ticketIds == null || ticketIds.isEmpty()) {
            return Map.of();
        }
        return ticketMapper.selectBatchIds(ticketIds).stream()
                .collect(Collectors.toMap(Ticket::getId, t -> t, (a, b) -> a));
    }

    private String truncate(String text) {
        if (text == null) {
            return null;
        }
        return text.length() > REMARK_MAX_LENGTH ? text.substring(0, REMARK_MAX_LENGTH) : text;
    }
}
