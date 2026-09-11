package com.itsm.smartitsm.module.team.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 团队成员 VO
 */
@Data
public class TeamMemberVO {

    private Long userId;
    private String username;
    private String realName;
    /** 团队身份：MEMBER/LEADER */
    private String teamRole;
    private LocalDateTime joinedAt;
}
