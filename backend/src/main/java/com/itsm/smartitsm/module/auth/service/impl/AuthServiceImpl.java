package com.itsm.smartitsm.module.auth.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.module.auth.dto.LoginDTO;
import com.itsm.smartitsm.module.auth.service.AuthService;
import com.itsm.smartitsm.module.auth.vo.LoginUserVO;
import com.itsm.smartitsm.module.auth.vo.LoginVO;
import com.itsm.smartitsm.module.permission.mapper.SysPermissionMapper;
import com.itsm.smartitsm.module.role.mapper.SysRoleMapper;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.security.JwtUtil;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 认证服务实现
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysPermissionMapper sysPermissionMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginVO login(LoginDTO dto) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, dto.getUsername()));
        if (user == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setTokenType(TOKEN_TYPE);
        loginVO.setExpiresIn(jwtUtil.getExpiresIn());
        loginVO.setUser(buildLoginUserVO(user));
        return loginVO;
    }

    @Override
    public LoginUserVO getCurrentUserInfo() {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        return buildLoginUserVO(loginUser.getUser());
    }

    @Override
    public void logout() {
        // JWT 无状态模式，后续可扩展 Redis Token 黑名单
    }

    private LoginUserVO buildLoginUserVO(SysUser user) {
        List<String> roles = sysRoleMapper.selectRoleCodesByUserId(user.getId());
        List<String> permissions = sysPermissionMapper.selectPermissionCodesByUserId(user.getId());
        LoginUserVO vo = new LoginUserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setEmployeeNo(user.getEmployeeNo());
        vo.setDepartmentId(user.getDepartmentId());
        vo.setRoles(roles != null ? roles : new ArrayList<>());
        vo.setPermissions(permissions != null ? permissions : new ArrayList<>());
        return vo;
    }
}
