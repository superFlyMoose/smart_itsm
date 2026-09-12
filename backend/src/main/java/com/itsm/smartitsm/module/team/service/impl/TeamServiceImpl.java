package com.itsm.smartitsm.module.team.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.common.cache.CacheKeys;
import com.itsm.smartitsm.common.cache.RedisCacheService;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.module.department.entity.SysDepartment;
import com.itsm.smartitsm.module.department.mapper.SysDepartmentMapper;
import com.itsm.smartitsm.module.team.dto.TeamMemberAddDTO;
import com.itsm.smartitsm.module.team.dto.TeamSaveDTO;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import com.itsm.smartitsm.module.team.entity.SysTeamMember;
import com.itsm.smartitsm.module.team.mapper.SysTeamMapper;
import com.itsm.smartitsm.module.team.mapper.SysTeamMemberMapper;
import com.itsm.smartitsm.module.team.service.TeamService;
import com.itsm.smartitsm.module.team.vo.TeamDetailVO;
import com.itsm.smartitsm.module.team.vo.TeamMemberVO;
import com.itsm.smartitsm.module.team.vo.TeamVO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 团队服务实现
 */
@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private static final String DEFAULT_TEAM_ROLE = "MEMBER";

    private final SysTeamMapper sysTeamMapper;
    private final SysTeamMemberMapper sysTeamMemberMapper;
    private final SysUserMapper sysUserMapper;
    private final SysDepartmentMapper sysDepartmentMapper;
    private final RedisCacheService cache;

    @Override
    public List<TeamVO> listTeams() {
        List<SysTeam> teams = sysTeamMapper.selectList(
                new LambdaQueryWrapper<SysTeam>()
                        .eq(SysTeam::getStatus, 1)
                        .orderByAsc(SysTeam::getId));
        if (teams.isEmpty()) {
            return new ArrayList<>();
        }
        Map<Long, String> departmentNames = sysDepartmentMapper
                .selectBatchIds(teams.stream().map(SysTeam::getDepartmentId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(SysDepartment::getId, SysDepartment::getName, (a, b) -> a));
        Set<Long> managerIds = teams.stream().map(SysTeam::getManagerId)
                .filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> managerNames = sysUserMapper.selectBatchIds(managerIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName, (a, b) -> a));

        return teams.stream().map(team -> {
            TeamVO vo = new TeamVO();
            vo.setId(team.getId());
            vo.setName(team.getName());
            vo.setDepartmentId(team.getDepartmentId());
            vo.setDepartmentName(departmentNames.get(team.getDepartmentId()));
            vo.setManagerId(team.getManagerId());
            vo.setManagerName(team.getManagerId() == null ? null : managerNames.get(team.getManagerId()));
            return vo;
        }).toList();
    }

    @Override
    public TeamDetailVO getTeamDetail(Long teamId) {
        SysTeam team = getTeamOrThrow(teamId);
        TeamDetailVO vo = new TeamDetailVO();
        vo.setId(team.getId());
        vo.setName(team.getName());
        vo.setDepartmentId(team.getDepartmentId());
        SysDepartment department = sysDepartmentMapper.selectById(team.getDepartmentId());
        if (department != null) {
            vo.setDepartmentName(department.getName());
        }
        vo.setManagerId(team.getManagerId());
        if (team.getManagerId() != null) {
            SysUser manager = sysUserMapper.selectById(team.getManagerId());
            if (manager != null) {
                vo.setManagerName(manager.getRealName());
            }
        }

        List<SysTeamMember> members = sysTeamMemberMapper.selectList(
                new LambdaQueryWrapper<SysTeamMember>()
                        .eq(SysTeamMember::getTeamId, teamId)
                        .orderByAsc(SysTeamMember::getId));
        Set<Long> userIds = members.stream().map(SysTeamMember::getUserId).collect(Collectors.toSet());
        Map<Long, SysUser> userMap = sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, user -> user, (a, b) -> a));
        List<TeamMemberVO> memberVOS = members.stream().map(member -> {
            TeamMemberVO memberVO = new TeamMemberVO();
            memberVO.setUserId(member.getUserId());
            memberVO.setTeamRole(member.getTeamRole());
            memberVO.setJoinedAt(member.getJoinedAt());
            SysUser user = userMap.get(member.getUserId());
            if (user != null) {
                memberVO.setUsername(user.getUsername());
                memberVO.setRealName(user.getRealName());
            }
            return memberVO;
        }).toList();
        vo.setMembers(memberVOS);
        return vo;
    }

    @Override
    public Long createTeam(TeamSaveDTO dto) {
        SysTeam team = new SysTeam();
        team.setName(dto.getName());
        team.setDepartmentId(dto.getDepartmentId());
        team.setManagerId(dto.getManagerId());
        team.setStatus(1);
        sysTeamMapper.insert(team);
        cache.deleteByPrefix(CacheKeys.TEAM_BASE_PREFIX);
        return team.getId();
    }

    @Override
    public void updateTeam(Long teamId, TeamSaveDTO dto) {
        SysTeam team = getTeamOrThrow(teamId);
        team.setName(dto.getName());
        team.setDepartmentId(dto.getDepartmentId());
        team.setManagerId(dto.getManagerId());
        sysTeamMapper.updateById(team);
        cache.deleteByPrefix(CacheKeys.TEAM_BASE_PREFIX);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addMember(Long teamId, TeamMemberAddDTO dto) {
        getTeamOrThrow(teamId);
        SysUser user = sysUserMapper.selectById(dto.getUserId());
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        Long existCount = sysTeamMemberMapper.selectCount(
                new LambdaQueryWrapper<SysTeamMember>()
                        .eq(SysTeamMember::getTeamId, teamId)
                        .eq(SysTeamMember::getUserId, dto.getUserId()));
        if (existCount > 0) {
            throw new BusinessException(ResultCode.DATA_DUPLICATED, "该用户已在团队中");
        }
        SysTeamMember member = new SysTeamMember();
        member.setTeamId(teamId);
        member.setUserId(dto.getUserId());
        member.setTeamRole(StringUtils.hasText(dto.getTeamRole()) ? dto.getTeamRole() : DEFAULT_TEAM_ROLE);
        sysTeamMemberMapper.insert(member);
    }

    @Override
    public void removeMember(Long teamId, Long userId) {
        sysTeamMemberMapper.delete(new LambdaQueryWrapper<SysTeamMember>()
                .eq(SysTeamMember::getTeamId, teamId)
                .eq(SysTeamMember::getUserId, userId));
    }

    private SysTeam getTeamOrThrow(Long teamId) {
        SysTeam team = sysTeamMapper.selectById(teamId);
        if (team == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "团队不存在");
        }
        return team;
    }
}
