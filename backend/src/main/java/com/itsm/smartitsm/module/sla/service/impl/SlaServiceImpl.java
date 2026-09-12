package com.itsm.smartitsm.module.sla.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.cache.CacheKeys;
import com.itsm.smartitsm.common.cache.RedisCacheService;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.common.util.TimeUtil;
import com.itsm.smartitsm.module.sla.dto.SlaRuleSaveDTO;
import com.itsm.smartitsm.module.sla.dto.SlaTicketQueryDTO;
import com.itsm.smartitsm.module.sla.entity.SlaRule;
import com.itsm.smartitsm.module.sla.entity.TicketSla;
import com.itsm.smartitsm.module.sla.mapper.SlaRuleMapper;
import com.itsm.smartitsm.module.sla.mapper.TicketSlaMapper;
import com.itsm.smartitsm.module.sla.service.SlaService;
import com.itsm.smartitsm.module.sla.vo.SlaRuleVO;
import com.itsm.smartitsm.module.sla.vo.SlaTicketVO;
import com.itsm.smartitsm.module.sla.vo.TicketSlaVO;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import com.itsm.smartitsm.module.team.mapper.SysTeamMapper;
import com.itsm.smartitsm.module.ticket.entity.Ticket;
import com.itsm.smartitsm.module.ticket.mapper.TicketMapper;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * SLA 服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SlaServiceImpl implements SlaService {

    /** SLA 规则缓存 TTL：1 小时 */
    private static final Duration RULE_TTL = Duration.ofHours(1);

    private final SlaRuleMapper slaRuleMapper;
    private final TicketSlaMapper ticketSlaMapper;
    private final TicketMapper ticketMapper;
    private final SysTeamMapper sysTeamMapper;
    private final SysUserMapper sysUserMapper;
    private final RedisCacheService cache;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initForTicket(Ticket ticket) {
        SlaRule rule = getEnabledRuleByPriority(ticket.getPriority());
        if (rule == null) {
            throw new BusinessException(ResultCode.SLA_CONFIG_ERROR,
                    "未找到优先级 " + ticket.getPriority() + " 对应的SLA规则");
        }
        LocalDateTime baseTime = ticket.getCreatedAt() != null ? ticket.getCreatedAt() : LocalDateTime.now();
        TicketSla ticketSla = new TicketSla();
        ticketSla.setTicketId(ticket.getId());
        ticketSla.setRuleId(rule.getId());
        ticketSla.setResponseDeadline(baseTime.plusMinutes(rule.getResponseMinutes()));
        ticketSla.setResolveDeadline(baseTime.plusMinutes(rule.getResolveMinutes()));
        ticketSla.setResponseBreached(0);
        ticketSla.setResolveBreached(0);
        ticketSlaMapper.insert(ticketSla);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markFirstResponse(Long ticketId, LocalDateTime time) {
        TicketSla ticketSla = getByTicketId(ticketId);
        if (ticketSla.getFirstResponseAt() != null) {
            return;
        }
        ticketSla.setFirstResponseAt(time);
        ticketSla.setResponseBreached(time.isAfter(ticketSla.getResponseDeadline()) ? 1 : 0);
        ticketSlaMapper.updateById(ticketSla);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markResolved(Long ticketId, LocalDateTime time) {
        TicketSla ticketSla = getByTicketId(ticketId);
        if (ticketSla.getResolvedAt() != null) {
            return;
        }
        ticketSla.setResolvedAt(time);
        ticketSla.setResolveBreached(time.isAfter(ticketSla.getResolveDeadline()) ? 1 : 0);
        ticketSlaMapper.updateById(ticketSla);
    }

    @Override
    public TicketSlaVO getTicketSla(Long ticketId) {
        TicketSla ticketSla = getByTicketId(ticketId);
        LocalDateTime now = LocalDateTime.now();
        TicketSlaVO vo = new TicketSlaVO();
        vo.setTicketId(ticketSla.getTicketId());
        vo.setResponseDeadline(ticketSla.getResponseDeadline());
        vo.setResolveDeadline(ticketSla.getResolveDeadline());
        vo.setFirstResponseAt(ticketSla.getFirstResponseAt());
        vo.setResolvedAt(ticketSla.getResolvedAt());
        // 已响应按实际时间判断，未响应按当前时间动态判断是否超时
        vo.setResponseBreached(ticketSla.getFirstResponseAt() != null
                ? ticketSla.getFirstResponseAt().isAfter(ticketSla.getResponseDeadline())
                : now.isAfter(ticketSla.getResponseDeadline()));
        vo.setResolveBreached(ticketSla.getResolvedAt() != null
                ? ticketSla.getResolvedAt().isAfter(ticketSla.getResolveDeadline())
                : now.isAfter(ticketSla.getResolveDeadline()));
        return vo;
    }

    @Override
    public PageResult<SlaTicketVO> pageSlaTickets(SlaTicketQueryDTO query) {
        LoginUser loginUser = SecurityUtils.getLoginUser();

        // 第一步：按数据权限与工单维度条件筛选可见工单ID
        LambdaQueryWrapper<Ticket> ticketWrapper = new LambdaQueryWrapper<>();
        ticketWrapper.select(Ticket::getId);
        applyDataScope(ticketWrapper, loginUser);
        ticketWrapper.eq(query.getPriority() != null, Ticket::getPriority, query.getPriority())
                .eq(query.getTeamId() != null, Ticket::getTeamId, query.getTeamId());
        LocalDateTime startTime = TimeUtil.parse(query.getStartTime(), false);
        LocalDateTime endTime = TimeUtil.parse(query.getEndTime(), true);
        ticketWrapper.ge(startTime != null, Ticket::getCreatedAt, startTime)
                .le(endTime != null, Ticket::getCreatedAt, endTime);
        List<Long> visibleTicketIds = ticketMapper.selectList(ticketWrapper).stream()
                .map(Ticket::getId).toList();
        if (visibleTicketIds.isEmpty()) {
            Page<TicketSla> emptyPage = PageUtil.build(query.getPageNum(), query.getPageSize());
            return PageResult.of(emptyPage, List.of());
        }

        // 第二步：分页查询工单 SLA 实例
        LambdaQueryWrapper<TicketSla> slaWrapper = new LambdaQueryWrapper<TicketSla>()
                .in(TicketSla::getTicketId, visibleTicketIds)
                .eq(query.getResponseBreached() != null,
                        TicketSla::getResponseBreached, Boolean.TRUE.equals(query.getResponseBreached()) ? 1 : 0)
                .eq(query.getResolveBreached() != null,
                        TicketSla::getResolveBreached, Boolean.TRUE.equals(query.getResolveBreached()) ? 1 : 0)
                .orderByDesc(TicketSla::getId);
        Page<TicketSla> page = ticketSlaMapper.selectPage(
                PageUtil.build(query.getPageNum(), query.getPageSize()), slaWrapper);

        List<Long> ticketIds = page.getRecords().stream().map(TicketSla::getTicketId).toList();
        Map<Long, Ticket> ticketMap = ticketMapper.selectBatchIds(ticketIds).stream()
                .collect(Collectors.toMap(Ticket::getId, ticket -> ticket, (a, b) -> a));
        Set<Long> teamIds = ticketMap.values().stream().map(Ticket::getTeamId)
                .filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> teamNames = sysTeamMapper.selectBatchIds(teamIds).stream()
                .collect(Collectors.toMap(SysTeam::getId, SysTeam::getName, (a, b) -> a));
        Set<Long> assigneeIds = ticketMap.values().stream().map(Ticket::getAssigneeId)
                .filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> assigneeNames = sysUserMapper.selectBatchIds(assigneeIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName, (a, b) -> a));

        List<SlaTicketVO> voList = page.getRecords().stream().map(ticketSla -> {
            Ticket ticket = ticketMap.get(ticketSla.getTicketId());
            SlaTicketVO vo = new SlaTicketVO();
            vo.setTicketId(ticketSla.getTicketId());
            if (ticket != null) {
                vo.setTicketNo(ticket.getTicketNo());
                vo.setTitle(ticket.getTitle());
                vo.setPriority(ticket.getPriority());
                vo.setStatus(ticket.getStatus());
                vo.setStatusName(com.itsm.smartitsm.common.enums.TicketStatusEnum.getNameByCode(ticket.getStatus()));
                vo.setTeamId(ticket.getTeamId());
                vo.setTeamName(ticket.getTeamId() == null ? null : teamNames.get(ticket.getTeamId()));
                vo.setAssigneeId(ticket.getAssigneeId());
                vo.setAssigneeName(ticket.getAssigneeId() == null ? null
                        : assigneeNames.get(ticket.getAssigneeId()));
            }
            vo.setResponseDeadline(ticketSla.getResponseDeadline());
            vo.setResolveDeadline(ticketSla.getResolveDeadline());
            vo.setFirstResponseAt(ticketSla.getFirstResponseAt());
            vo.setResolvedAt(ticketSla.getResolvedAt());
            vo.setResponseBreached(ticketSla.getResponseBreached() != null && ticketSla.getResponseBreached() == 1);
            vo.setResolveBreached(ticketSla.getResolveBreached() != null && ticketSla.getResolveBreached() == 1);
            return vo;
        }).toList();
        return PageResult.of(page, voList);
    }

    @Override
    public List<SlaRuleVO> listRules() {
        return slaRuleMapper.selectList(new LambdaQueryWrapper<SlaRule>()
                        .orderByAsc(SlaRule::getPriority)).stream()
                .map(this::toRuleVO).toList();
    }

    @Override
    public Long createRule(SlaRuleSaveDTO dto) {
        SlaRule rule = new SlaRule();
        applyRuleDto(rule, dto);
        rule.setStatus(1);
        slaRuleMapper.insert(rule);
        cache.deleteByPrefix(CacheKeys.SLA_RULE_PREFIX);
        return rule.getId();
    }

    @Override
    public void updateRule(Long ruleId, SlaRuleSaveDTO dto) {
        SlaRule rule = getRuleOrThrow(ruleId);
        applyRuleDto(rule, dto);
        slaRuleMapper.updateById(rule);
        cache.deleteByPrefix(CacheKeys.SLA_RULE_PREFIX);
    }

    @Override
    public void disableRule(Long ruleId) {
        SlaRule rule = getRuleOrThrow(ruleId);
        rule.setStatus(0);
        slaRuleMapper.updateById(rule);
        cache.deleteByPrefix(CacheKeys.SLA_RULE_PREFIX);
    }

    /**
     * 按优先级获取启用的 SLA 规则（缓存优先，未命中回源并回填）
     */
    private SlaRule getEnabledRuleByPriority(String priority) {
        String key = CacheKeys.slaRuleByPriority(priority);
        SlaRule cached = cache.get(key);
        if (cached != null) {
            return cached;
        }
        SlaRule rule = slaRuleMapper.selectOne(new LambdaQueryWrapper<SlaRule>()
                .eq(SlaRule::getPriority, priority)
                .eq(SlaRule::getStatus, 1)
                .last("LIMIT 1"));
        if (rule != null) {
            cache.set(key, rule, RULE_TTL);
        }
        return rule;
    }

    private void applyRuleDto(SlaRule rule, SlaRuleSaveDTO dto) {
        rule.setName(dto.getName());
        rule.setPriority(dto.getPriority().name());
        rule.setResponseMinutes(dto.getResponseMinutes());
        rule.setResolveMinutes(dto.getResolveMinutes());
        rule.setEscalationMinutes(dto.getEscalationMinutes());
    }

    private SlaRule getRuleOrThrow(Long ruleId) {
        SlaRule rule = slaRuleMapper.selectById(ruleId);
        if (rule == null) {
            throw new BusinessException(ResultCode.SLA_RULE_NOT_FOUND);
        }
        return rule;
    }

    private TicketSla getByTicketId(Long ticketId) {
        TicketSla ticketSla = ticketSlaMapper.selectOne(new LambdaQueryWrapper<TicketSla>()
                .eq(TicketSla::getTicketId, ticketId)
                .last("LIMIT 1"));
        if (ticketSla == null) {
            throw new BusinessException(ResultCode.SLA_CONFIG_ERROR, "工单SLA记录不存在");
        }
        return ticketSla;
    }

    /**
     * 工单数据权限：管理员全部；团队负责人看团队；工程师看分配给自己；普通用户看自己创建
     */
    private void applyDataScope(LambdaQueryWrapper<Ticket> wrapper, LoginUser loginUser) {
        Long userId = loginUser.getUserId();
        if (loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage")) {
            return;
        }
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

    private SlaRuleVO toRuleVO(SlaRule rule) {
        SlaRuleVO vo = new SlaRuleVO();
        vo.setId(rule.getId());
        vo.setName(rule.getName());
        vo.setPriority(rule.getPriority());
        vo.setResponseMinutes(rule.getResponseMinutes());
        vo.setResolveMinutes(rule.getResolveMinutes());
        vo.setEscalationMinutes(rule.getEscalationMinutes());
        vo.setStatus(rule.getStatus());
        return vo;
    }
}
