package com.itsm.smartitsm.module.team.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.itsm.smartitsm.module.team.entity.SysTeamMember;
import org.apache.ibatis.annotations.Mapper;

/**
 * 团队成员关系 Mapper
 */
@Mapper
public interface SysTeamMemberMapper extends BaseMapper<SysTeamMember> {
}
