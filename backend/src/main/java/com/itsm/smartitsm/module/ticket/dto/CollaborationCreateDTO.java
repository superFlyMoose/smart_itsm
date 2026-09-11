package com.itsm.smartitsm.module.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 发起协作 DTO
 */
@Data
public class CollaborationCreateDTO {

    @NotNull(message = "协作人不能为空")
    private Long collaboratorId;

    private String message;
}
