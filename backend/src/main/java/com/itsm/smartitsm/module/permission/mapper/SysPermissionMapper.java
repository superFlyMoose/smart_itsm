package com.itsm.smartitsm.module.permission.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.permission.entity.SysPermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 权限 Mapper
 */
@Mapper
public interface SysPermissionMapper extends BaseMapper<SysPermission> {

    /**
     * 查询用户拥有的权限列表（通过角色-权限关系聚合）
     */
    @Select("SELECT DISTINCT p.* FROM sys_permission p "
            + "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id "
            + "INNER JOIN sys_user_role ur ON rp.role_id = ur.role_id "
            + "WHERE ur.user_id = #{userId}")
    List<SysPermission> selectPermissionsByUserId(@Param("userId") Long userId);

    /**
     * 查询用户拥有的权限编码集合
     */
    @Select("SELECT DISTINCT p.permission_code FROM sys_permission p "
            + "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id "
            + "INNER JOIN sys_user_role ur ON rp.role_id = ur.role_id "
            + "WHERE ur.user_id = #{userId}")
    List<String> selectPermissionCodesByUserId(@Param("userId") Long userId);

    /**
     * 查询角色拥有的权限列表
     */
    @Select("SELECT p.* FROM sys_permission p "
            + "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id "
            + "WHERE rp.role_id = #{roleId}")
    List<SysPermission> selectPermissionsByRoleId(@Param("roleId") Long roleId);
}
