package com.itsm.smartitsm.module.team.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.team.dto.TeamMemberAddDTO;
import com.itsm.smartitsm.module.team.dto.TeamSaveDTO;
import com.itsm.smartitsm.module.team.service.TeamService;
import com.itsm.smartitsm.module.team.vo.TeamDetailVO;
import com.itsm.smartitsm.module.team.vo.TeamVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 团队接口
 */
@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    /**
     * 查询团队列表
     */
    @GetMapping
    public Result<List<TeamVO>> list() {
        return Result.success(teamService.listTeams());
    }

    /**
     * 查询团队详情
     */
    @GetMapping("/{teamId}")
    public Result<TeamDetailVO> detail(@PathVariable Long teamId) {
        return Result.success(teamService.getTeamDetail(teamId));
    }

    /**
     * 创建团队
     */
    @PostMapping
    @PreAuthorize("hasAuthority('team:manage')")
    public Result<Long> create(@Valid @RequestBody TeamSaveDTO dto) {
        return Result.success(teamService.createTeam(dto));
    }

    /**
     * 修改团队
     */
    @PutMapping("/{teamId}")
    @PreAuthorize("hasAuthority('team:manage')")
    public Result<Void> update(@PathVariable Long teamId, @Valid @RequestBody TeamSaveDTO dto) {
        teamService.updateTeam(teamId, dto);
        return Result.success();
    }

    /**
     * 添加团队成员
     */
    @PostMapping("/{teamId}/members")
    @PreAuthorize("hasAuthority('team:manage')")
    public Result<Void> addMember(@PathVariable Long teamId, @Valid @RequestBody TeamMemberAddDTO dto) {
        teamService.addMember(teamId, dto);
        return Result.success();
    }

    /**
     * 删除团队成员
     */
    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasAuthority('team:manage')")
    public Result<Void> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return Result.success();
    }
}
