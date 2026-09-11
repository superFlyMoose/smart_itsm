package com.itsm.smartitsm.module.sla.service;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.module.sla.dto.SlaRuleSaveDTO;
import com.itsm.smartitsm.module.sla.dto.SlaTicketQueryDTO;
import com.itsm.smartitsm.module.sla.vo.SlaRuleVO;
import com.itsm.smartitsm.module.sla.vo.SlaTicketVO;
import com.itsm.smartitsm.module.sla.vo.TicketSlaVO;
import com.itsm.smartitsm.module.ticket.entity.Ticket;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SLA 服务
 */
public interface SlaService {

    /**
     * 创建工单时根据优先级匹配 SLA 规则并生成工单 SLA 实例
     */
    void initForTicket(Ticket ticket);

    /**
     * 记录首次响应时间（接受工单时调用，不覆盖已有值）
     */
    void markFirstResponse(Long ticketId, LocalDateTime time);

    /**
     * 记录解决时间（提交解决方案时调用，不覆盖已有值）
     */
    void markResolved(Long ticketId, LocalDateTime time);

    /**
     * 查询单个工单 SLA 详情（动态计算是否超时）
     */
    TicketSlaVO getTicketSla(Long ticketId);

    /**
     * 分页查询工单 SLA 列表（带数据权限）
     */
    PageResult<SlaTicketVO> pageSlaTickets(SlaTicketQueryDTO query);

    /**
     * 查询 SLA 规则列表
     */
    List<SlaRuleVO> listRules();

    /**
     * 创建 SLA 规则
     */
    Long createRule(SlaRuleSaveDTO dto);

    /**
     * 修改 SLA 规则
     */
    void updateRule(Long ruleId, SlaRuleSaveDTO dto);

    /**
     * 禁用 SLA 规则
     */
    void disableRule(Long ruleId);
}
