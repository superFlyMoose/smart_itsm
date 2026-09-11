package com.itsm.smartitsm.module.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.user.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 系统用户 Mapper
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
