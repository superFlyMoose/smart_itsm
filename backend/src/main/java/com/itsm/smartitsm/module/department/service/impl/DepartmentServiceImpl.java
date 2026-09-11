package com.itsm.smartitsm.module.department.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.module.department.dto.DepartmentSaveDTO;
import com.itsm.smartitsm.module.department.entity.SysDepartment;
import com.itsm.smartitsm.module.department.mapper.SysDepartmentMapper;
import com.itsm.smartitsm.module.department.service.DepartmentService;
import com.itsm.smartitsm.module.department.vo.DepartmentTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 部门服务实现
 */
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final SysDepartmentMapper sysDepartmentMapper;

    @Override
    public List<DepartmentTreeVO> tree() {
        List<SysDepartment> departments = sysDepartmentMapper.selectList(
                new LambdaQueryWrapper<SysDepartment>()
                        .eq(SysDepartment::getStatus, 1)
                        .orderByAsc(SysDepartment::getId));
        List<DepartmentTreeVO> nodes = departments.stream().map(this::toTreeVO).toList();
        Map<Long, List<DepartmentTreeVO>> childrenMap = nodes.stream()
                .filter(node -> node.getParentId() != null)
                .collect(Collectors.groupingBy(DepartmentTreeVO::getParentId));
        List<DepartmentTreeVO> roots = new ArrayList<>();
        for (DepartmentTreeVO node : nodes) {
            node.setChildren(childrenMap.getOrDefault(node.getId(), new ArrayList<>()));
            if (node.getParentId() == null) {
                roots.add(node);
            }
        }
        return roots;
    }

    @Override
    public Long createDepartment(DepartmentSaveDTO dto) {
        SysDepartment department = new SysDepartment();
        department.setName(dto.getName());
        department.setParentId(dto.getParentId());
        department.setManagerId(dto.getManagerId());
        department.setStatus(1);
        sysDepartmentMapper.insert(department);
        return department.getId();
    }

    @Override
    public void updateDepartment(Long departmentId, DepartmentSaveDTO dto) {
        SysDepartment department = getDepartmentOrThrow(departmentId);
        department.setName(dto.getName());
        department.setParentId(dto.getParentId());
        department.setManagerId(dto.getManagerId());
        sysDepartmentMapper.updateById(department);
    }

    @Override
    public void disableDepartment(Long departmentId) {
        SysDepartment department = getDepartmentOrThrow(departmentId);
        department.setStatus(0);
        sysDepartmentMapper.updateById(department);
    }

    private SysDepartment getDepartmentOrThrow(Long departmentId) {
        SysDepartment department = sysDepartmentMapper.selectById(departmentId);
        if (department == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "部门不存在");
        }
        return department;
    }

    private DepartmentTreeVO toTreeVO(SysDepartment department) {
        DepartmentTreeVO vo = new DepartmentTreeVO();
        vo.setId(department.getId());
        vo.setName(department.getName());
        vo.setParentId(department.getParentId());
        vo.setManagerId(department.getManagerId());
        return vo;
    }
}
