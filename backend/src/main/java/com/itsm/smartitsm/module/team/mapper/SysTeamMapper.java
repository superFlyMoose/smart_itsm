package com.itsm.smartitsm.module.team.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.team.entity.SysTeam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 团队 Mapper
 */
@Mapper
public interface SysTeamMapper extends BaseMapper<SysTeam> {

    /**
     * 查询用户管理的团队ID集合（担任团队负责人或团队 LEADER 成员）
     */
    @Select("SELECT id FROM sys_team WHERE manager_id = #{userId} AND status = 1 "
            + "UNION "
            + "SELECT team_id FROM sys_team_member WHERE user_id = #{userId} AND team_role = 'LEADER'")
    List<Long> selectManagedTeamIds(@Param("userId") Long userId);

    /**
     * 统计用户是否属于指定团队
     */
    @Select("SELECT COUNT(1) FROM sys_team_member WHERE team_id = #{teamId} AND user_id = #{userId}")
    int countTeamMember(@Param("teamId") Long teamId, @Param("userId") Long userId);

    /**
     * 查询团队成员用户ID集合
     */
    @Select("SELECT user_id FROM sys_team_member WHERE team_id = #{teamId}")
    List<Long> selectTeamMemberIds(@Param("teamId") Long teamId);

    /**
     * 查询团队 LEADER 成员用户ID集合
     */
    @Select("SELECT user_id FROM sys_team_member WHERE team_id = #{teamId} AND team_role = 'LEADER'")
    List<Long> selectTeamLeaderIds(@Param("teamId") Long teamId);

    /**
     * 查询用户首个所属团队ID（用于创建工单时自动分配团队）
     */
    @Select("SELECT team_id FROM sys_team_member WHERE user_id = #{userId} ORDER BY joined_at LIMIT 1")
    Long selectFirstTeamIdByUserId(@Param("userId") Long userId);
}
