package com.itsm.smartitsm.module.category.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 分类树节点 VO
 */
@Data
public class CategoryTreeVO {

    private Long id;
    private String name;
    private Long parentId;
    private String description;
    private List<CategoryTreeVO> children = new ArrayList<>();
}
