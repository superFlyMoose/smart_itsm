package com.itsm.smartitsm.module.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 团队创建/修改 DTO
 */
@Data
public class TeamSaveDTO {

    @NotBlank(message = "团队名称不能为空")
    @Size(max = 100, message = "团队名称长度不能超过100")
    private String name;

    @NotNull(message = "所属部门不能为空")
    private Long departmentId;

    private Long managerId;
}
