package com.itsm.smartitsm.module.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 工单分类创建/修改 DTO
 */
@Data
public class CategorySaveDTO {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100")
    private String name;

    private Long parentId;

    private String description;
}
