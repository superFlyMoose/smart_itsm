package com.itsm.smartitsm.module.team.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * IT服务团队表 sys_team
 */
@Data
@TableName("sys_team")
public class SysTeam {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 团队名称 */
    private String name;

    /** 所属部门ID */
    private Long departmentId;

    /** 团队负责人ID */
    private Long managerId;

    /** 状态：1启用 0禁用 */
    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
