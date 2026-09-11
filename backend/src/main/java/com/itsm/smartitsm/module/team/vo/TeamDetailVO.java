package com.itsm.smartitsm.module.team.vo;

import lombok.Data;

import java.util.List;

/**
 * 团队详情 VO
 */
@Data
public class TeamDetailVO {

    private Long id;
    private String name;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private List<TeamMemberVO> members;
}
