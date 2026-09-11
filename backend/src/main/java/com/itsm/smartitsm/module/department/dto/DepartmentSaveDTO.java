package com.itsm.smartitsm.module.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 部门创建/修改 DTO
 */
@Data
public class DepartmentSaveDTO {

    @NotBlank(message = "部门名称不能为空")
    @Size(max = 100, message = "部门名称长度不能超过100")
    private String name;

    private Long parentId;

    private Long managerId;
}
