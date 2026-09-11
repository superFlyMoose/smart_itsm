package com.itsm.smartitsm.module.department.service;

import com.itsm.smartitsm.module.department.dto.DepartmentSaveDTO;
import com.itsm.smartitsm.module.department.vo.DepartmentTreeVO;

import java.util.List;

/**
 * 部门服务
 */
public interface DepartmentService {

    /**
     * 查询部门树
     */
    List<DepartmentTreeVO> tree();

    /**
     * 创建部门
     */
    Long createDepartment(DepartmentSaveDTO dto);

    /**
     * 修改部门
     */
    void updateDepartment(Long departmentId, DepartmentSaveDTO dto);

    /**
     * 禁用部门
     */
    void disableDepartment(Long departmentId);
}
