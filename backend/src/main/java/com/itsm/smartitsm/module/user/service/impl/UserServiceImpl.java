package com.itsm.smartitsm.module.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.module.department.entity.SysDepartment;
import com.itsm.smartitsm.module.department.mapper.SysDepartmentMapper;
import com.itsm.smartitsm.module.role.entity.SysUserRole;
import com.itsm.smartitsm.module.role.mapper.SysRoleMapper;
import com.itsm.smartitsm.module.role.mapper.SysUserRoleMapper;
import com.itsm.smartitsm.module.user.dto.PasswordUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserAdminUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserCreateDTO;
import com.itsm.smartitsm.module.user.dto.UserProfileUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserQueryDTO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.module.user.service.UserService;
import com.itsm.smartitsm.module.user.vo.UserVO;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 用户服务实现
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysUserMapper sysUserMapper;
    private final SysDepartmentMapper sysDepartmentMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysUserRoleMapper sysUserRoleMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResult<UserVO> pageUsers(UserQueryDTO query) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(query.getUsername()), SysUser::getUsername, query.getUsername())
                .like(StringUtils.hasText(query.getRealName()), SysUser::getRealName, query.getRealName())
                .eq(StringUtils.hasText(query.getEmployeeNo()), SysUser::getEmployeeNo, query.getEmployeeNo())
                .eq(query.getDepartmentId() != null, SysUser::getDepartmentId, query.getDepartmentId())
                .eq(StringUtils.hasText(query.getStatus()),
                        SysUser::getStatus, STATUS_DISABLED.equals(query.getStatus()) ? 0 : 1)
                .orderByDesc(SysUser::getId);

        Page<SysUser> page = sysUserMapper.selectPage(PageUtil.build(query.getPageNum(), query.getPageSize()),
                wrapper);
        List<UserVO> voList = page.getRecords().stream().map(this::buildUserVO).toList();
        return PageResult.of(page, voList);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO createUser(UserCreateDTO dto) {
        Long usernameCount = sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, dto.getUsername()));
        if (usernameCount > 0) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }
        Long employeeNoCount = sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getEmployeeNo, dto.getEmployeeNo()));
        if (employeeNoCount > 0) {
            throw new BusinessException(ResultCode.DATA_DUPLICATED, "员工编号已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmployeeNo(dto.getEmployeeNo());
        user.setRealName(dto.getRealName());
        user.setDepartmentId(dto.getDepartmentId());
        user.setPosition(dto.getPosition());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setStatus(1);
        sysUserMapper.insert(user);
        return buildUserVO(user);
    }

    @Override
    public void updateUser(Long userId, UserAdminUpdateDTO dto) {
        SysUser user = getUserOrThrow(userId);
        if (StringUtils.hasText(dto.getRealName())) {
            user.setRealName(dto.getRealName());
        }
        user.setDepartmentId(dto.getDepartmentId());
        user.setPosition(dto.getPosition());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        sysUserMapper.updateById(user);
    }

    @Override
    public void disableUser(Long userId) {
        SysUser user = getUserOrThrow(userId);
        user.setStatus(0);
        sysUserMapper.updateById(user);
    }

    @Override
    public UserVO getMyProfile() {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        return buildUserVO(loginUser.getUser());
    }

    @Override
    public void updateMyProfile(UserProfileUpdateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        SysUser user = getUserOrThrow(loginUser.getUserId());
        // 普通用户只能修改开放的个人信息，不能修改部门、状态、角色
        if (StringUtils.hasText(dto.getRealName())) {
            user.setRealName(dto.getRealName());
        }
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setPosition(dto.getPosition());
        sysUserMapper.updateById(user);
    }

    @Override
    public void changePassword(PasswordUpdateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        SysUser user = getUserOrThrow(loginUser.getUserId());
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "原密码不正确");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        sysUserMapper.updateById(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignRoles(Long userId, List<Long> roleIds) {
        getUserOrThrow(userId);
        sysUserRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>()
                .eq(SysUserRole::getUserId, userId));
        if (!CollectionUtils.isEmpty(roleIds)) {
            for (Long roleId : roleIds) {
                SysUserRole userRole = new SysUserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                sysUserRoleMapper.insert(userRole);
            }
        }
    }

    private SysUser getUserOrThrow(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return user;
    }

    /**
     * 构建用户 VO，批量填充部门名称与角色编码
     */
    private UserVO buildUserVO(SysUser user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setEmployeeNo(user.getEmployeeNo());
        vo.setRealName(user.getRealName());
        vo.setDepartmentId(user.getDepartmentId());
        if (user.getDepartmentId() != null) {
            SysDepartment department = sysDepartmentMapper.selectById(user.getDepartmentId());
            if (department != null) {
                vo.setDepartmentName(department.getName());
            }
        }
        vo.setPosition(user.getPosition());
        vo.setPhone(user.getPhone());
        vo.setEmail(user.getEmail());
        vo.setStatus(user.getStatus() != null && user.getStatus() == 1 ? STATUS_ACTIVE : STATUS_DISABLED);
        List<String> roleCodes = sysRoleMapper.selectRoleCodesByUserId(user.getId());
        vo.setRoles(roleCodes != null ? roleCodes : new ArrayList<>());
        return vo;
    }

    /**
     * 批量构建用户简要信息映射（供其他模块使用）
     */
    public Map<Long, String> getUserRealNameMap(Set<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName, (a, b) -> a));
    }

    /**
     * 批量获取用户实体映射
     */
    public Map<Long, SysUser> getUserMap(Set<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity(), (a, b) -> a));
    }
}
