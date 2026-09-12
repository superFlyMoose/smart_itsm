package com.itsm.smartitsm.module.user.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.user.dto.PasswordUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserAdminUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserCreateDTO;
import com.itsm.smartitsm.module.user.dto.UserProfileUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserQueryDTO;
import com.itsm.smartitsm.module.user.dto.UserRoleAssignDTO;
import com.itsm.smartitsm.module.user.service.UserService;
import com.itsm.smartitsm.module.user.vo.UserOptionVO;
import com.itsm.smartitsm.module.user.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户接口
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 分页查询用户（管理员）
     */
    @GetMapping
    @PreAuthorize("hasAuthority('user:manage')")
    public Result<PageResult<UserVO>> pageUsers(UserQueryDTO query) {
        return Result.success(userService.pageUsers(query));
    }

    /**
     * 查询启用用户简要选项（任意登录用户可用，供协作人等下拉选择，不暴露敏感字段）
     */
    @GetMapping("/options")
    public Result<List<UserOptionVO>> listActiveOptions() {
        return Result.success(userService.listActiveOptions());
    }

    /**
     * 查询当前登录用户信息
     */
    @GetMapping("/me")
    public Result<UserVO> getMyProfile() {
        return Result.success(userService.getMyProfile());
    }

    /**
     * 修改当前登录用户个人信息
     */
    @PutMapping("/me")
    public Result<Void> updateMyProfile(@Valid @RequestBody UserProfileUpdateDTO dto) {
        userService.updateMyProfile(dto);
        return Result.success();
    }

    /**
     * 修改当前登录用户密码
     */
    @PostMapping("/me/password")
    public Result<Void> changePassword(@Valid @RequestBody PasswordUpdateDTO dto) {
        userService.changePassword(dto);
        return Result.success();
    }

    /**
     * 创建用户（管理员）
     */
    @PostMapping
    @PreAuthorize("hasAuthority('user:manage')")
    public Result<UserVO> createUser(@Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.createUser(dto));
    }

    /**
     * 修改用户（管理员）
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('user:manage')")
    public Result<Void> updateUser(@PathVariable Long userId,
                                   @Valid @RequestBody UserAdminUpdateDTO dto) {
        userService.updateUser(userId, dto);
        return Result.success();
    }

    /**
     * 禁用用户（管理员）
     */
    @PostMapping("/{userId}/disable")
    @PreAuthorize("hasAuthority('user:manage')")
    public Result<Void> disableUser(@PathVariable Long userId) {
        userService.disableUser(userId);
        return Result.success();
    }

    /**
     * 给用户分配角色（管理员）
     */
    @PostMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('user:manage')")
    public Result<Void> assignRoles(@PathVariable Long userId,
                                    @Valid @RequestBody UserRoleAssignDTO dto) {
        userService.assignRoles(userId, dto.getRoleIds());
        return Result.success();
    }
}
