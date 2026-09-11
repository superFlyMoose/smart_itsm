package com.itsm.smartitsm.module.team.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 添加团队成员 DTO
 */
@Data
public class TeamMemberAddDTO {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /** 团队身份：MEMBER/LEADER，默认 MEMBER */
    private String teamRole;
}
