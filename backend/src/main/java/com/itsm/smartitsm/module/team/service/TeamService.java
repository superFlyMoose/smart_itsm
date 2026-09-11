package com.itsm.smartitsm.module.team.service;

import com.itsm.smartitsm.module.team.dto.TeamMemberAddDTO;
import com.itsm.smartitsm.module.team.dto.TeamSaveDTO;
import com.itsm.smartitsm.module.team.vo.TeamDetailVO;
import com.itsm.smartitsm.module.team.vo.TeamVO;

import java.util.List;

/**
 * 团队服务
 */
public interface TeamService {

    /**
     * 查询启用团队列表
     */
    List<TeamVO> listTeams();

    /**
     * 查询团队详情（含成员）
     */
    TeamDetailVO getTeamDetail(Long teamId);

    /**
     * 创建团队
     */
    Long createTeam(TeamSaveDTO dto);

    /**
     * 修改团队
     */
    void updateTeam(Long teamId, TeamSaveDTO dto);

    /**
     * 添加团队成员
     */
    void addMember(Long teamId, TeamMemberAddDTO dto);

    /**
     * 删除团队成员
     */
    void removeMember(Long teamId, Long userId);
}
