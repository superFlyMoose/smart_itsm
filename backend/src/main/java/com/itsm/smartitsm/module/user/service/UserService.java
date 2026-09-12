package com.itsm.smartitsm.module.user.service;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.module.user.dto.PasswordUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserAdminUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserCreateDTO;
import com.itsm.smartitsm.module.user.dto.UserProfileUpdateDTO;
import com.itsm.smartitsm.module.user.dto.UserQueryDTO;
import com.itsm.smartitsm.module.user.vo.UserOptionVO;
import com.itsm.smartitsm.module.user.vo.UserVO;

import java.util.List;

/**
 * 用户服务
 */
public interface UserService {

    /**
     * 分页查询用户（管理员）
     */
    PageResult<UserVO> pageUsers(UserQueryDTO query);

    /**
     * 查询启用状态用户的简要选项（登录用户可用，供协作人等下拉选择）
     */
    List<UserOptionVO> listActiveOptions();

    /**
     * 创建用户（管理员）
     */
    UserVO createUser(UserCreateDTO dto);

    /**
     * 修改用户（管理员）
     */
    void updateUser(Long userId, UserAdminUpdateDTO dto);

    /**
     * 禁用用户（管理员）
     */
    void disableUser(Long userId);

    /**
     * 查询当前登录用户信息
     */
    UserVO getMyProfile();

    /**
     * 修改当前登录用户个人信息
     */
    void updateMyProfile(UserProfileUpdateDTO dto);

    /**
     * 修改当前登录用户密码
     */
    void changePassword(PasswordUpdateDTO dto);

    /**
     * 给用户分配角色
     */
    void assignRoles(Long userId, List<Long> roleIds);
}
