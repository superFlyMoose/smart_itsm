package com.itsm.smartitsm.module.team.vo;

import lombok.Data;

/**
 * 团队 VO
 */
@Data
public class TeamVO {

    private Long id;
    private String name;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
}
