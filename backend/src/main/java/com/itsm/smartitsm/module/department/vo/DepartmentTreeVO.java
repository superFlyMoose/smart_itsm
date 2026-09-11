package com.itsm.smartitsm.module.department.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 部门树节点 VO
 */
@Data
public class DepartmentTreeVO {

    private Long id;
    private String name;
    private Long parentId;
    private Long managerId;
    private List<DepartmentTreeVO> children = new ArrayList<>();
}
