package com.itsm.smartitsm.module.ticket.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用关联对象简要信息 VO（部门/团队/分类等）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleRefVO {

    private Long id;
    private String name;
}
