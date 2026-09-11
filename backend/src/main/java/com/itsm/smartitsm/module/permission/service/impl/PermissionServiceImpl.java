package com.itsm.smartitsm.module.permission.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.module.permission.entity.SysPermission;
import com.itsm.smartitsm.module.permission.mapper.SysPermissionMapper;
import com.itsm.smartitsm.module.permission.service.PermissionService;
import com.itsm.smartitsm.module.permission.vo.PermissionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 权限服务实现
 */
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final SysPermissionMapper sysPermissionMapper;

    @Override
    public List<PermissionVO> listPermissions() {
        List<SysPermission> permissions = sysPermissionMapper.selectList(
                new LambdaQueryWrapper<SysPermission>().orderByAsc(SysPermission::getId));
        return permissions.stream().map(permission -> {
            PermissionVO vo = new PermissionVO();
            vo.setId(permission.getId());
            vo.setPermissionCode(permission.getPermissionCode());
            vo.setPermissionName(permission.getPermissionName());
            vo.setDescription(permission.getDescription());
            return vo;
        }).toList();
    }
}
