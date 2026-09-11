package com.itsm.smartitsm.module.ticket.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户简要信息 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleUserVO {

    private Long id;
    private String realName;
}
