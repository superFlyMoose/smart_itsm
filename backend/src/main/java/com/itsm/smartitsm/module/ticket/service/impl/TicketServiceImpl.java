package com.itsm.smartitsm.module.ticket.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.enums.CollaborationStatusEnum;
import com.itsm.smartitsm.common.enums.NotificationTypeEnum;
import com.itsm.smartitsm.common.enums.TicketActionEnum;
import com.itsm.smartitsm.common.enums.TicketPriorityEnum;
import com.itsm.smartitsm.common.enums.TicketStatusEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.common.util.TimeUtil;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import com.itsm.smartitsm.module.category.mapper.TicketCategoryMapper;
import com.itsm.smartitsm.module.department.entity.SysDepartment;
import com.itsm.smartitsm.module.department.mapper.SysDepartmentMapper;
import com.itsm.smartitsm.module.notification.service.NotificationService;
import com.itsm.smartitsm.module.sla.service.SlaService;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import com.itsm.smartitsm.module.team.mapper.SysTeamMapper;
import com.itsm.smartitsm.module.ticket.dto.CollaborationCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.CommentCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketAssignDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketCancelDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketEscalateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketNudgeDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketProcessDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketQueryDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketRatingCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketRejectDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketResolveDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketTransferDTO;
import com.itsm.smartitsm.module.ticket.entity.Ticket;
import com.itsm.smartitsm.module.ticket.entity.TicketAttachment;
import com.itsm.smartitsm.module.ticket.entity.TicketCollaboration;
import com.itsm.smartitsm.module.ticket.entity.TicketComment;
import com.itsm.smartitsm.module.ticket.entity.TicketHistory;
import com.itsm.smartitsm.module.ticket.entity.TicketRating;
import com.itsm.smartitsm.module.ticket.mapper.TicketAttachmentMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketCollaborationMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketCommentMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketHistoryMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketMapper;
import com.itsm.smartitsm.module.ticket.mapper.TicketRatingMapper;
import com.itsm.smartitsm.module.ticket.service.TicketService;
import com.itsm.smartitsm.module.ticket.service.TicketTransferRequestService;
import com.itsm.smartitsm.module.ticket.statemachine.TicketStateMachine;
import com.itsm.smartitsm.module.ticket.vo.CollaborationVO;
import com.itsm.smartitsm.module.ticket.vo.CommentVO;
import com.itsm.smartitsm.module.ticket.vo.SimpleRefVO;
import com.itsm.smartitsm.module.ticket.vo.SimpleUserVO;
import com.itsm.smartitsm.module.ticket.vo.TicketAttachmentVO;
import com.itsm.smartitsm.module.ticket.vo.TicketCreateVO;
import com.itsm.smartitsm.module.ticket.vo.TicketDetailVO;
import com.itsm.smartitsm.module.ticket.vo.TicketHistoryVO;
import com.itsm.smartitsm.module.ticket.vo.TicketListVO;
import com.itsm.smartitsm.module.ticket.vo.TicketRatingVO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 工单服务实现，工单状态流转统一由 TicketStateMachine 校验，
 * 状态更新采用带状态条件的乐观更新防止并发重复流转
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private static final String RELATED_TYPE_TICKET = "TICKET";
    private static final int REMARK_MAX_LENGTH = 500;

    private final TicketMapper ticketMapper;
    private final TicketCommentMapper ticketCommentMapper;
    private final TicketHistoryMapper ticketHistoryMapper;
    private final TicketCollaborationMapper ticketCollaborationMapper;
    private final TicketAttachmentMapper ticketAttachmentMapper;
    private final TicketRatingMapper ticketRatingMapper;
    private final TicketCategoryMapper ticketCategoryMapper;
    private final SysUserMapper sysUserMapper;
    private final SysTeamMapper sysTeamMapper;
    private final SysDepartmentMapper sysDepartmentMapper;
    private final TicketStateMachine ticketStateMachine;
    private final SlaService slaService;
    private final NotificationService notificationService;
    private final TicketTransferRequestService ticketTransferRequestService;

    @Value("${smart-itsm.storage.upload-dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TicketCreateVO createTicket(TicketCreateDTO dto, String clientIp) {
        LoginUser loginUser = SecurityUtils.getLoginUser();

        TicketCategory category = ticketCategoryMapper.selectById(dto.getCategoryId());
        if (category == null || category.getStatus() == null || category.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工单分类不存在或已禁用");
        }
        if (dto.getTeamId() != null) {
            SysTeam team = sysTeamMapper.selectById(dto.getTeamId());
            if (team == null || team.getStatus() == null || team.getStatus() != 1) {
                throw new BusinessException(ResultCode.NOT_FOUND, "处理团队不存在或已禁用");
            }
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNo(generateTicketNo());
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategoryId(dto.getCategoryId());
        ticket.setPriority(dto.getPriority().name());
        ticket.setTeamId(dto.getTeamId());
        ticket.setCreatorId(loginUser.getUserId());
        ticket.setDepartmentId(loginUser.getUser().getDepartmentId());
        ticket.setStatus(TicketStatusEnum.OPEN.name());
        ticket.setClientIp(clientIp);
        ticketMapper.insert(ticket);

        // 根据优先级匹配 SLA 规则并生成工单 SLA
        slaService.initForTicket(ticket);

        recordHistory(ticket.getId(), loginUser.getUserId(), TicketActionEnum.CREATE,
                null, TicketStatusEnum.OPEN.name(), "创建工单");

        return new TicketCreateVO(ticket.getId(), ticket.getTicketNo(),
                TicketStatusEnum.OPEN.name(), TicketStatusEnum.OPEN.getStatusName());
    }

    @Override
    public PageResult<TicketListVO> pageTickets(TicketQueryDTO query) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        applyDataScope(wrapper, loginUser);
        wrapper.like(StringUtils.hasText(query.getTicketNo()), Ticket::getTicketNo, query.getTicketNo())
                .like(StringUtils.hasText(query.getTitle()), Ticket::getTitle, query.getTitle())
                .eq(StringUtils.hasText(query.getStatus()), Ticket::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getPriority()), Ticket::getPriority, query.getPriority())
                .eq(query.getCategoryId() != null, Ticket::getCategoryId, query.getCategoryId())
                .eq(query.getTeamId() != null, Ticket::getTeamId, query.getTeamId())
                .eq(query.getAssigneeId() != null, Ticket::getAssigneeId, query.getAssigneeId())
                .eq(query.getCreatorId() != null, Ticket::getCreatorId, query.getCreatorId())
                .eq(query.getDepartmentId() != null, Ticket::getDepartmentId, query.getDepartmentId());
        LocalDateTime startTime = TimeUtil.parse(query.getStartTime(), false);
        LocalDateTime endTime = TimeUtil.parse(query.getEndTime(), true);
        wrapper.ge(startTime != null, Ticket::getCreatedAt, startTime)
                .le(endTime != null, Ticket::getCreatedAt, endTime)
                .orderByDesc(Ticket::getCreatedAt);

        Page<Ticket> page = ticketMapper.selectPage(PageUtil.build(query.getPageNum(), query.getPageSize()),
                wrapper);

        List<Ticket> records = page.getRecords();
        Map<Long, String> userNames = batchLoadUserNames(collectUserIds(records));
        Map<Long, String> teamNames = batchLoadTeamNames(
                records.stream().map(Ticket::getTeamId).collect(Collectors.toSet()));
        Map<Long, String> categoryNames = batchLoadCategoryNames(
                records.stream().map(Ticket::getCategoryId).collect(Collectors.toSet()));

        List<TicketListVO> voList = records.stream().map(ticket -> {
            TicketListVO vo = new TicketListVO();
            vo.setId(ticket.getId());
            vo.setTicketNo(ticket.getTicketNo());
            vo.setTitle(ticket.getTitle());
            vo.setPriority(ticket.getPriority());
            vo.setPriorityName(TicketPriorityEnum.getNameByCode(ticket.getPriority()));
            vo.setStatus(ticket.getStatus());
            vo.setStatusName(TicketStatusEnum.getNameByCode(ticket.getStatus()));
            vo.setCreatorId(ticket.getCreatorId());
            vo.setCreatorName(ticket.getCreatorId() == null ? null : userNames.get(ticket.getCreatorId()));
            vo.setAssigneeId(ticket.getAssigneeId());
            vo.setAssigneeName(ticket.getAssigneeId() == null ? null : userNames.get(ticket.getAssigneeId()));
            vo.setTeamId(ticket.getTeamId());
            vo.setTeamName(ticket.getTeamId() == null ? null : teamNames.get(ticket.getTeamId()));
            vo.setCategoryId(ticket.getCategoryId());
            vo.setCategoryName(ticket.getCategoryId() == null ? null
                    : categoryNames.get(ticket.getCategoryId()));
            vo.setCreatedAt(ticket.getCreatedAt());
            return vo;
        }).toList();
        return PageResult.of(page, voList);
    }

    @Override
    public TicketDetailVO getTicketDetail(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());

        TicketDetailVO vo = new TicketDetailVO();
        vo.setId(ticket.getId());
        vo.setTicketNo(ticket.getTicketNo());
        vo.setTitle(ticket.getTitle());
        vo.setDescription(ticket.getDescription());
        vo.setCreator(buildSimpleUser(ticket.getCreatorId()));
        if (ticket.getDepartmentId() != null) {
            SysDepartment department = sysDepartmentMapper.selectById(ticket.getDepartmentId());
            if (department != null) {
                vo.setDepartment(new SimpleRefVO(department.getId(), department.getName()));
            }
        }
        if (ticket.getTeamId() != null) {
            SysTeam team = sysTeamMapper.selectById(ticket.getTeamId());
            if (team != null) {
                vo.setTeam(new SimpleRefVO(team.getId(), team.getName()));
            }
        }
        vo.setAssignee(buildSimpleUser(ticket.getAssigneeId()));
        if (ticket.getCategoryId() != null) {
            TicketCategory category = ticketCategoryMapper.selectById(ticket.getCategoryId());
            if (category != null) {
                vo.setCategory(new SimpleRefVO(category.getId(), category.getName()));
            }
        }
        vo.setPriority(ticket.getPriority());
        vo.setPriorityName(TicketPriorityEnum.getNameByCode(ticket.getPriority()));
        vo.setStatus(ticket.getStatus());
        vo.setStatusName(TicketStatusEnum.getNameByCode(ticket.getStatus()));
        vo.setFirstResponseAt(ticket.getFirstResponseAt());
        vo.setResolvedAt(ticket.getResolvedAt());
        vo.setClosedAt(ticket.getClosedAt());
        vo.setCreatedAt(ticket.getCreatedAt());
        vo.setUpdatedAt(ticket.getUpdatedAt());
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assign(Long ticketId, TicketAssignDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.ASSIGN);

        validateTeamAndEngineer(dto.getTeamId(), dto.getAssigneeId(), ResultCode.TICKET_ASSIGN_FAILED);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getTeamId, dto.getTeamId())
                .set(Ticket::getAssigneeId, dto.getAssigneeId())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.ASSIGN,
                current.name(), target.name(), dto.getRemark());
        notificationService.create(dto.getAssigneeId(), NotificationTypeEnum.TICKET_ASSIGNED,
                "您有新的工单待处理",
                "工单[" + ticket.getTicketNo() + "]" + ticket.getTitle() + " 已分配给您，请及时接受处理。",
                RELATED_TYPE_TICKET, ticketId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void accept(Long ticketId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        if (ticket.getAssigneeId() == null || !ticket.getAssigneeId().equals(loginUser.getUserId())) {
            throw new BusinessException(ResultCode.NOT_TICKET_ASSIGNEE);
        }
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.ACCEPT);

        LocalDateTime now = LocalDateTime.now();
        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name())
                .setSql("first_response_at = IF(first_response_at IS NULL, NOW(), first_response_at)"));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        // 首次接受时同步记录工单 SLA 首次响应时间，已存在则不覆盖
        if (ticket.getFirstResponseAt() == null) {
            slaService.markFirstResponse(ticketId, now);
        }
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.ACCEPT,
                current.name(), target.name(), "工程师接受工单");
        notificationService.create(ticket.getCreatorId(), NotificationTypeEnum.TICKET_ACCEPTED,
                "您的工单已被接受",
                "工单[" + ticket.getTicketNo() + "] 已被工程师接受并开始处理。",
                RELATED_TYPE_TICKET, ticketId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transfer(Long ticketId, TicketTransferDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.TRANSFER);

        validateTeamAndEngineer(dto.getTargetTeamId(), dto.getTargetAssigneeId(),
                ResultCode.TICKET_TRANSFER_FAILED);

        // 跨团队转派：交由转派申请服务发起待审批申请，工单状态暂不变更，等待目标团队负责人审批
        if (ticket.getTeamId() == null || !ticket.getTeamId().equals(dto.getTargetTeamId())) {
            if (ticket.getTeamId() == null) {
                throw new BusinessException(ResultCode.TICKET_TRANSFER_FAILED, "工单未分配团队，无法发起跨团队转派");
            }
            ticketTransferRequestService.createRequest(ticketId,
                    dto.getTargetTeamId(), dto.getTargetAssigneeId(), dto.getRemark());
            return;
        }

        // 同团队转派：直接执行转移
        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getTeamId, dto.getTargetTeamId())
                .set(Ticket::getAssigneeId, dto.getTargetAssigneeId())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        String remark = "工单转派给新工程师处理。" + (StringUtils.hasText(dto.getRemark()) ? dto.getRemark() : "");
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.TRANSFER,
                current.name(), target.name(), remark);
        notificationService.create(dto.getTargetAssigneeId(), NotificationTypeEnum.TICKET_TRANSFERRED,
                "您有转派的工单待接受",
                "工单[" + ticket.getTicketNo() + "]" + ticket.getTitle() + " 已转派给您，请及时接受处理。",
                RELATED_TYPE_TICKET, ticketId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void process(Long ticketId, TicketProcessDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkAssignee(ticket, loginUser);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.PROCESS);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        addCommentEntity(ticketId, loginUser.getUserId(), dto.getContent());
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.PROCESS,
                current.name(), target.name(), truncate(dto.getContent()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resolve(Long ticketId, TicketResolveDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkAssignee(ticket, loginUser);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.RESOLVE);

        LocalDateTime now = LocalDateTime.now();
        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name())
                .set(Ticket::getResolvedAt, now));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        // 解决方案以评论形式留存
        addCommentEntity(ticketId, loginUser.getUserId(),
                "解决方案：" + dto.getResolution()
                        + (StringUtils.hasText(dto.getRemark()) ? "\n备注：" + dto.getRemark() : ""));
        slaService.markResolved(ticketId, now);
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.RESOLVE,
                current.name(), target.name(),
                truncate(StringUtils.hasText(dto.getRemark()) ? dto.getRemark() : "工程师提交解决方案"));
        notificationService.create(ticket.getCreatorId(), NotificationTypeEnum.TICKET_RESOLVED,
                "您的工单已提交解决方案，请确认",
                "工单[" + ticket.getTicketNo() + "] 已提交解决方案，请及时确认问题是否解决。",
                RELATED_TYPE_TICKET, ticketId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirm(Long ticketId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkCreator(ticket, loginUser);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.CLOSE);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name())
                .set(Ticket::getClosedAt, LocalDateTime.now()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.CLOSE,
                current.name(), target.name(), "用户确认解决，工单关闭");
        if (ticket.getAssigneeId() != null) {
            notificationService.create(ticket.getAssigneeId(), NotificationTypeEnum.TICKET_CLOSED,
                    "工单已关闭",
                    "工单[" + ticket.getTicketNo() + "] 已被用户确认解决并关闭。",
                    RELATED_TYPE_TICKET, ticketId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long ticketId, TicketRejectDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkCreator(ticket, loginUser);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(
                current, TicketActionEnum.REJECT_RESOLUTION);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        addCommentEntity(ticketId, loginUser.getUserId(), "拒绝解决方案，原因：" + dto.getReason());
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.REJECT_RESOLUTION,
                current.name(), target.name(), truncate(dto.getReason()));
        if (ticket.getAssigneeId() != null) {
            notificationService.create(ticket.getAssigneeId(), NotificationTypeEnum.TICKET_REJECTED,
                    "工单解决方案被拒绝，请重新处理",
                    "工单[" + ticket.getTicketNo() + "] 的解决方案被用户拒绝，请重新处理。拒绝原因："
                            + dto.getReason(),
                    RELATED_TYPE_TICKET, ticketId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long ticketId, TicketCancelDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        boolean isCreator = ticket.getCreatorId().equals(loginUser.getUserId());
        boolean isAdmin = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");
        if (!isCreator && !isAdmin) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只能取消自己创建的工单");
        }
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.CANCEL);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.CANCEL,
                current.name(), target.name(),
                truncate(StringUtils.hasText(dto.getReason()) ? dto.getReason() : "工单取消"));
        if (ticket.getAssigneeId() != null) {
            notificationService.create(ticket.getAssigneeId(), NotificationTypeEnum.TICKET_CANCELLED,
                    "工单已取消",
                    "工单[" + ticket.getTicketNo() + "] 已被取消。",
                    RELATED_TYPE_TICKET, ticketId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void nudge(Long ticketId, TicketNudgeDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkCreator(ticket, loginUser);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        if (current.isTerminal()) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR, "工单已结束，无法催办");
        }
        String message = StringUtils.hasText(dto.getMessage()) ? dto.getMessage() : "请尽快处理该工单。";
        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.NUDGE,
                current.name(), current.name(), truncate("催办：" + message));

        String content = "工单[" + ticket.getTicketNo() + "] 被催办：" + message;
        if (ticket.getAssigneeId() != null) {
            notificationService.create(ticket.getAssigneeId(), NotificationTypeEnum.TICKET_NUDGE,
                    "工单催办提醒", content, RELATED_TYPE_TICKET, ticketId);
        }
        notifyTeamManagers(ticket, NotificationTypeEnum.TICKET_NUDGE, "工单催办提醒", content);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void escalate(Long ticketId, TicketEscalateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(current, TicketActionEnum.ESCALATE);

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.ESCALATE,
                current.name(), target.name(), truncate("升级：" + dto.getReason()));
        notifyTeamManagers(ticket, NotificationTypeEnum.TICKET_ESCALATED,
                "工单升级提醒",
                "工单[" + ticket.getTicketNo() + "] 已升级，请关注处理进度。升级原因：" + dto.getReason());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addComment(Long ticketId, CommentCreateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, loginUser);
        Long commentId = addCommentEntity(ticketId, loginUser.getUserId(), dto.getContent());

        // 评论通知：创建人评论通知处理人，处理人评论通知创建人
        String content = "工单[" + ticket.getTicketNo() + "] 有新评论：" + dto.getContent();
        if (loginUser.getUserId().equals(ticket.getCreatorId()) && ticket.getAssigneeId() != null) {
            notificationService.create(ticket.getAssigneeId(), NotificationTypeEnum.TICKET_COMMENTED,
                    "工单有新评论", content, RELATED_TYPE_TICKET, ticketId);
        } else if (!loginUser.getUserId().equals(ticket.getCreatorId())) {
            notificationService.create(ticket.getCreatorId(), NotificationTypeEnum.TICKET_COMMENTED,
                    "工单有新评论", content, RELATED_TYPE_TICKET, ticketId);
        }
        return commentId;
    }

    @Override
    public List<CommentVO> listComments(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());
        List<TicketComment> comments = ticketCommentMapper.selectList(
                new LambdaQueryWrapper<TicketComment>()
                        .eq(TicketComment::getTicketId, ticketId)
                        .orderByAsc(TicketComment::getCreatedAt)
                        .orderByAsc(TicketComment::getId));
        Map<Long, String> userNames = batchLoadUserNames(
                comments.stream().map(TicketComment::getUserId).collect(Collectors.toSet()));
        return comments.stream().map(comment -> {
            CommentVO vo = new CommentVO();
            vo.setId(comment.getId());
            vo.setUser(new SimpleUserVO(comment.getUserId(), userNames.get(comment.getUserId())));
            vo.setContent(comment.getContent());
            vo.setCreatedAt(comment.getCreatedAt());
            return vo;
        }).toList();
    }

    @Override
    public List<TicketHistoryVO> listHistory(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());
        List<TicketHistory> histories = ticketHistoryMapper.selectList(
                new LambdaQueryWrapper<TicketHistory>()
                        .eq(TicketHistory::getTicketId, ticketId)
                        .orderByAsc(TicketHistory::getCreatedAt)
                        .orderByAsc(TicketHistory::getId));
        Map<Long, String> userNames = batchLoadUserNames(
                histories.stream().map(TicketHistory::getOperatorId).collect(Collectors.toSet()));
        return histories.stream().map(history -> {
            TicketHistoryVO vo = new TicketHistoryVO();
            vo.setId(history.getId());
            vo.setOperator(new SimpleUserVO(history.getOperatorId(), userNames.get(history.getOperatorId())));
            vo.setAction(history.getAction());
            vo.setFromStatus(history.getFromStatus());
            vo.setToStatus(history.getToStatus());
            vo.setRemark(history.getRemark());
            vo.setCreatedAt(history.getCreatedAt());
            return vo;
        }).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createCollaboration(Long ticketId, CollaborationCreateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        boolean isAssignee = ticket.getAssigneeId() != null
                && ticket.getAssigneeId().equals(loginUser.getUserId());
        boolean isAdmin = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");
        if (!isAssignee && !isAdmin) {
            throw new BusinessException(ResultCode.NOT_TICKET_ASSIGNEE, "只有当前处理人可以发起协作");
        }
        SysUser collaborator = sysUserMapper.selectById(dto.getCollaboratorId());
        if (collaborator == null || collaborator.getStatus() == null || collaborator.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND, "协作人不存在或已禁用");
        }

        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        TicketStatusEnum target = ticketStateMachine.validateTransition(
                current, TicketActionEnum.COLLABORATE);

        int rows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                .eq(Ticket::getId, ticketId)
                .eq(Ticket::getStatus, current.name())
                .set(Ticket::getStatus, target.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR);
        }

        TicketCollaboration collaboration = new TicketCollaboration();
        collaboration.setTicketId(ticketId);
        collaboration.setRequesterId(loginUser.getUserId());
        collaboration.setCollaboratorId(dto.getCollaboratorId());
        collaboration.setMessage(dto.getMessage());
        collaboration.setStatus(CollaborationStatusEnum.PENDING.name());
        ticketCollaborationMapper.insert(collaboration);

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.COLLABORATE,
                current.name(), target.name(),
                truncate("发起协作，协作人：" + collaborator.getRealName()
                        + (StringUtils.hasText(dto.getMessage()) ? "，" + dto.getMessage() : "")));
        notificationService.create(dto.getCollaboratorId(), NotificationTypeEnum.TICKET_COLLABORATION,
                "您有新的协作请求",
                "工单[" + ticket.getTicketNo() + "] 邀请您协助处理："
                        + (StringUtils.hasText(dto.getMessage()) ? dto.getMessage() : ticket.getTitle()),
                RELATED_TYPE_TICKET, ticketId);
        return collaboration.getId();
    }

    @Override
    public List<CollaborationVO> listCollaborations(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());
        List<TicketCollaboration> collaborations = ticketCollaborationMapper.selectList(
                new LambdaQueryWrapper<TicketCollaboration>()
                        .eq(TicketCollaboration::getTicketId, ticketId)
                        .orderByDesc(TicketCollaboration::getId));
        Set<Long> userIds = new HashSet<>();
        collaborations.forEach(collaboration -> {
            userIds.add(collaboration.getRequesterId());
            userIds.add(collaboration.getCollaboratorId());
        });
        Map<Long, String> userNames = batchLoadUserNames(userIds);
        return collaborations.stream().map(collaboration -> {
            CollaborationVO vo = new CollaborationVO();
            vo.setId(collaboration.getId());
            vo.setRequester(new SimpleUserVO(collaboration.getRequesterId(),
                    userNames.get(collaboration.getRequesterId())));
            vo.setCollaborator(new SimpleUserVO(collaboration.getCollaboratorId(),
                    userNames.get(collaboration.getCollaboratorId())));
            vo.setMessage(collaboration.getMessage());
            vo.setStatus(collaboration.getStatus());
            vo.setCreatedAt(collaboration.getCreatedAt());
            vo.setCompletedAt(collaboration.getCompletedAt());
            return vo;
        }).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void acceptCollaboration(Long ticketId, Long collaborationId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        TicketCollaboration collaboration = getCollaborationOrThrow(ticketId, collaborationId);
        if (!collaboration.getCollaboratorId().equals(loginUser.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有协作人可以接受协作");
        }
        if (!CollaborationStatusEnum.PENDING.name().equals(collaboration.getStatus())) {
            throw new BusinessException(ResultCode.COLLABORATION_STATUS_ERROR,
                    "协作任务当前状态不允许接受");
        }
        int rows = ticketCollaborationMapper.update(null,
                new LambdaUpdateWrapper<TicketCollaboration>()
                        .eq(TicketCollaboration::getId, collaborationId)
                        .eq(TicketCollaboration::getStatus, CollaborationStatusEnum.PENDING.name())
                        .set(TicketCollaboration::getStatus, CollaborationStatusEnum.PROCESSING.name()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.COLLABORATION_STATUS_ERROR);
        }
        // 注意：协作记录状态变化不改变工单状态，工单仍为 WAITING_COLLABORATION
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeCollaboration(Long ticketId, Long collaborationId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        TicketCollaboration collaboration = getCollaborationOrThrow(ticketId, collaborationId);
        if (!collaboration.getCollaboratorId().equals(loginUser.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有协作人可以完成协作");
        }
        if (!CollaborationStatusEnum.PROCESSING.name().equals(collaboration.getStatus())) {
            throw new BusinessException(ResultCode.COLLABORATION_STATUS_ERROR,
                    "协作任务当前状态不允许完成");
        }
        int rows = ticketCollaborationMapper.update(null,
                new LambdaUpdateWrapper<TicketCollaboration>()
                        .eq(TicketCollaboration::getId, collaborationId)
                        .eq(TicketCollaboration::getStatus, CollaborationStatusEnum.PROCESSING.name())
                        .set(TicketCollaboration::getStatus, CollaborationStatusEnum.COMPLETED.name())
                        .set(TicketCollaboration::getCompletedAt, LocalDateTime.now()));
        if (rows == 0) {
            throw new BusinessException(ResultCode.COLLABORATION_STATUS_ERROR);
        }

        // 不存在其他未完成（PENDING/PROCESSING）协作时，工单回到处理中
        Long unfinishedCount = ticketCollaborationMapper.selectCount(
                new LambdaQueryWrapper<TicketCollaboration>()
                        .eq(TicketCollaboration::getTicketId, ticketId)
                        .ne(TicketCollaboration::getId, collaborationId)
                        .in(TicketCollaboration::getStatus,
                                CollaborationStatusEnum.PENDING.name(),
                                CollaborationStatusEnum.PROCESSING.name()));
        TicketStatusEnum current = TicketStatusEnum.valueOf(ticket.getStatus());
        if (unfinishedCount == 0
                && TicketStatusEnum.WAITING_COLLABORATION == current) {
            int ticketRows = ticketMapper.update(null, new LambdaUpdateWrapper<Ticket>()
                    .eq(Ticket::getId, ticketId)
                    .eq(Ticket::getStatus, TicketStatusEnum.WAITING_COLLABORATION.name())
                    .set(Ticket::getStatus, TicketStatusEnum.PROCESSING.name()));
            if (ticketRows > 0) {
                recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.COLLABORATION_COMPLETE,
                        TicketStatusEnum.WAITING_COLLABORATION.name(),
                        TicketStatusEnum.PROCESSING.name(), "全部协作完成，工单恢复处理");
            }
        } else {
            recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.COLLABORATION_COMPLETE,
                    current.name(), current.name(), "协作任务完成，仍有其他协作进行中");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TicketAttachmentVO uploadAttachment(Long ticketId, MultipartFile file) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, loginUser);
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "上传文件不能为空");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }
        String storedFilename = UUID.randomUUID().toString().replace("-", "") + extension;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path targetPath = uploadPath.resolve(storedFilename);
        try {
            Files.createDirectories(uploadPath);
            file.transferTo(targetPath.toFile());
        } catch (IOException e) {
            throw new BusinessException(ResultCode.SYSTEM_ERROR, "文件保存失败");
        }

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicketId(ticketId);
        attachment.setUploaderId(loginUser.getUserId());
        attachment.setFileName(originalFilename);
        attachment.setFileUrl("/uploads/" + storedFilename);
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());
        ticketAttachmentMapper.insert(attachment);

        TicketAttachmentVO vo = new TicketAttachmentVO();
        vo.setId(attachment.getId());
        vo.setFileName(attachment.getFileName());
        vo.setFileUrl(attachment.getFileUrl());
        vo.setFileSize(attachment.getFileSize());
        vo.setContentType(attachment.getContentType());
        vo.setUploaderId(attachment.getUploaderId());
        vo.setUploaderName(loginUser.getUser().getRealName());
        vo.setCreatedAt(attachment.getCreatedAt());
        return vo;
    }

    @Override
    public List<TicketAttachmentVO> listAttachments(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());
        List<TicketAttachment> attachments = ticketAttachmentMapper.selectList(
                new LambdaQueryWrapper<TicketAttachment>()
                        .eq(TicketAttachment::getTicketId, ticketId)
                        .orderByDesc(TicketAttachment::getId));
        Map<Long, String> userNames = batchLoadUserNames(
                attachments.stream().map(TicketAttachment::getUploaderId).collect(Collectors.toSet()));
        return attachments.stream().map(attachment -> {
            TicketAttachmentVO vo = new TicketAttachmentVO();
            vo.setId(attachment.getId());
            vo.setFileName(attachment.getFileName());
            vo.setFileUrl(attachment.getFileUrl());
            vo.setFileSize(attachment.getFileSize());
            vo.setContentType(attachment.getContentType());
            vo.setUploaderId(attachment.getUploaderId());
            vo.setUploaderName(userNames.get(attachment.getUploaderId()));
            vo.setCreatedAt(attachment.getCreatedAt());
            return vo;
        }).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAttachment(Long ticketId, Long attachmentId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        getTicketOrThrow(ticketId);
        TicketAttachment attachment = ticketAttachmentMapper.selectById(attachmentId);
        if (attachment == null || !ticketId.equals(attachment.getTicketId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "附件不存在或不属于该工单");
        }
        boolean isUploader = attachment.getUploaderId().equals(loginUser.getUserId());
        boolean isAdmin = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");
        if (!isUploader && !isAdmin) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有上传者或管理员可以删除附件");
        }
        ticketAttachmentMapper.deleteById(attachmentId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rateTicket(Long ticketId, TicketRatingCreateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        Ticket ticket = getTicketOrThrow(ticketId);
        // 仅工单创建人可评价
        checkCreator(ticket, loginUser);
        // 仅已关闭工单可评价
        if (!TicketStatusEnum.CLOSED.name().equals(ticket.getStatus())) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR, "仅已关闭的工单可以评价");
        }
        // 每个用户对同一工单只能评价一次
        Long existCount = ticketRatingMapper.selectCount(
                new LambdaQueryWrapper<TicketRating>()
                        .eq(TicketRating::getTicketId, ticketId)
                        .eq(TicketRating::getUserId, loginUser.getUserId()));
        if (existCount > 0) {
            throw new BusinessException(ResultCode.DATA_DUPLICATED, "您已评价过该工单");
        }

        TicketRating rating = new TicketRating();
        rating.setTicketId(ticketId);
        rating.setUserId(loginUser.getUserId());
        rating.setScore(dto.getScore());
        rating.setComment(dto.getComment());
        ticketRatingMapper.insert(rating);

        recordHistory(ticketId, loginUser.getUserId(), TicketActionEnum.RATE,
                ticket.getStatus(), ticket.getStatus(),
                truncate("评价工单：" + dto.getScore() + "星"
                        + (StringUtils.hasText(dto.getComment()) ? "，" + dto.getComment() : "")));
    }

    @Override
    public TicketRatingVO getRating(Long ticketId) {
        Ticket ticket = getTicketOrThrow(ticketId);
        checkViewable(ticket, SecurityUtils.getLoginUser());
        TicketRating rating = ticketRatingMapper.selectOne(
                new LambdaQueryWrapper<TicketRating>()
                        .eq(TicketRating::getTicketId, ticketId)
                        .last("LIMIT 1"));
        if (rating == null) {
            return null;
        }
        TicketRatingVO vo = new TicketRatingVO();
        vo.setId(rating.getId());
        vo.setTicketId(rating.getTicketId());
        vo.setUser(buildSimpleUser(rating.getUserId()));
        vo.setScore(rating.getScore());
        vo.setComment(rating.getComment());
        vo.setCreatedAt(rating.getCreatedAt());
        return vo;
    }

    // ========================= 内部辅助方法 =========================

    private Ticket getTicketOrThrow(Long ticketId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(ResultCode.TICKET_NOT_FOUND);
        }
        return ticket;
    }

    private TicketCollaboration getCollaborationOrThrow(Long ticketId, Long collaborationId) {
        TicketCollaboration collaboration = ticketCollaborationMapper.selectById(collaborationId);
        if (collaboration == null || !ticketId.equals(collaboration.getTicketId())) {
            throw new BusinessException(ResultCode.COLLABORATION_NOT_FOUND);
        }
        return collaboration;
    }

    /**
     * 数据权限校验：管理员全部；团队负责人可看团队工单；工程师可看分配给自己的；普通用户可看自己创建的
     */
    private void checkViewable(Ticket ticket, LoginUser loginUser) {
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
        if (loginUser.getUserId().equals(ticket.getCreatorId())) {
            return;
        }
        if (loginUser.hasPermission("ticket:view:assigned")
                && loginUser.getUserId().equals(ticket.getAssigneeId())) {
            return;
        }
        if (loginUser.hasPermission("ticket:view:team")
                && ticket.getTeamId() != null
                && sysTeamMapper.selectManagedTeamIds(loginUser.getUserId()).contains(ticket.getTeamId())) {
            return;
        }
        throw new BusinessException(ResultCode.FORBIDDEN, "无权查看该工单");
    }

    /**
     * 列表数据权限过滤
     */
    private void applyDataScope(LambdaQueryWrapper<Ticket> wrapper, LoginUser loginUser) {
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
        Long userId = loginUser.getUserId();
        wrapper.and(w -> {
            w.eq(Ticket::getCreatorId, userId);
            if (loginUser.hasPermission("ticket:view:assigned")) {
                w.or().eq(Ticket::getAssigneeId, userId);
            }
            if (loginUser.hasPermission("ticket:view:team")) {
                List<Long> managedTeamIds = sysTeamMapper.selectManagedTeamIds(userId);
                if (!managedTeamIds.isEmpty()) {
                    w.or().in(Ticket::getTeamId, managedTeamIds);
                }
            }
        });
    }

    private void checkCreator(Ticket ticket, LoginUser loginUser) {
        if (!loginUser.getUserId().equals(ticket.getCreatorId())) {
            throw new BusinessException(ResultCode.NOT_TICKET_CREATOR);
        }
    }

    private void checkAssignee(Ticket ticket, LoginUser loginUser) {
        boolean isAssignee = ticket.getAssigneeId() != null
                && ticket.getAssigneeId().equals(loginUser.getUserId());
        boolean isAdmin = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");
        if (!isAssignee && !isAdmin) {
            throw new BusinessException(ResultCode.NOT_TICKET_ASSIGNEE);
        }
    }

    /**
     * 校验目标团队存在且目标工程师属于该团队
     */
    private void validateTeamAndEngineer(Long teamId, Long assigneeId, ResultCode failCode) {
        SysTeam team = sysTeamMapper.selectById(teamId);
        if (team == null || team.getStatus() == null || team.getStatus() != 1) {
            throw new BusinessException(failCode, "目标团队不存在或已禁用");
        }
        SysUser assignee = sysUserMapper.selectById(assigneeId);
        if (assignee == null || assignee.getStatus() == null || assignee.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND, "目标工程师不存在或已禁用");
        }
        if (sysTeamMapper.countTeamMember(teamId, assigneeId) <= 0) {
            throw new BusinessException(failCode, "目标工程师不属于该团队");
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

    private Long addCommentEntity(Long ticketId, Long userId, String content) {
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        comment.setContent(content);
        ticketCommentMapper.insert(comment);
        return comment.getId();
    }

    /**
     * 通知工单所属团队的负责人（团队 manager + LEADER 成员）
     */
    private void notifyTeamManagers(Ticket ticket, NotificationTypeEnum type,
                                    String title, String content) {
        if (ticket.getTeamId() == null) {
            return;
        }
        Set<Long> managerIds = new HashSet<>();
        SysTeam team = sysTeamMapper.selectById(ticket.getTeamId());
        if (team != null && team.getManagerId() != null) {
            managerIds.add(team.getManagerId());
        }
        managerIds.addAll(sysTeamMapper.selectTeamLeaderIds(ticket.getTeamId()));
        managerIds.forEach(managerId ->
                notificationService.create(managerId, type, title, content,
                        RELATED_TYPE_TICKET, ticket.getId()));
    }

    /**
     * 生成业务工单号：IT + yyyyMMdd + 4 位当日序号
     */
    private String generateTicketNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "IT" + datePart;
        List<Ticket> sameDay = ticketMapper.selectList(new LambdaQueryWrapper<Ticket>()
                .likeRight(Ticket::getTicketNo, prefix)
                .orderByDesc(Ticket::getTicketNo)
                .last("LIMIT 1"));
        int sequence = 1;
        if (!sameDay.isEmpty()) {
            String lastNo = sameDay.get(0).getTicketNo();
            try {
                sequence = Integer.parseInt(lastNo.substring(prefix.length())) + 1;
            } catch (NumberFormatException ignored) {
                // 历史数据格式异常时从 1 开始
            }
        }
        return prefix + String.format("%04d", sequence);
    }

    private SimpleUserVO buildSimpleUser(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = sysUserMapper.selectById(userId);
        return user == null ? null : new SimpleUserVO(user.getId(), user.getRealName());
    }

    private Set<Long> collectUserIds(List<Ticket> tickets) {
        Set<Long> userIds = new HashSet<>();
        tickets.forEach(ticket -> {
            if (ticket.getCreatorId() != null) {
                userIds.add(ticket.getCreatorId());
            }
            if (ticket.getAssigneeId() != null) {
                userIds.add(ticket.getAssigneeId());
            }
        });
        return userIds;
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

    private Map<Long, String> batchLoadCategoryNames(Set<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Map.of();
        }
        return ticketCategoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(TicketCategory::getId, TicketCategory::getName, (a, b) -> a));
    }

    private String truncate(String text) {
        if (text == null) {
            return null;
        }
        return text.length() > REMARK_MAX_LENGTH ? text.substring(0, REMARK_MAX_LENGTH) : text;
    }
}
