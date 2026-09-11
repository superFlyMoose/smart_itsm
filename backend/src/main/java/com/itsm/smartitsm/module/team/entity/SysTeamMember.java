package com.itsm.smartitsm.module.team.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 团队成员关系表 sys_team_member
 */
@Data
@TableName("sys_team_member")
public class SysTeamMember {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 团队ID */
    private Long teamId;

    /** 用户ID */
    private Long userId;

    /** 团队身份：MEMBER/LEADER */
    private String teamRole;

    /** 加入时间 */
    private LocalDateTime joinedAt;
}
