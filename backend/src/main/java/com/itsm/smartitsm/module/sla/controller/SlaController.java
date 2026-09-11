package com.itsm.smartitsm.module.sla.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.sla.dto.SlaRuleSaveDTO;
import com.itsm.smartitsm.module.sla.dto.SlaTicketQueryDTO;
import com.itsm.smartitsm.module.sla.service.SlaService;
import com.itsm.smartitsm.module.sla.vo.SlaRuleVO;
import com.itsm.smartitsm.module.sla.vo.SlaTicketVO;
import com.itsm.smartitsm.module.sla.vo.TicketSlaVO;
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
 * SLA 接口
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SlaController {

    private final SlaService slaService;

    /**
     * 查询单个工单 SLA
     */
    @GetMapping("/tickets/{ticketId}/sla")
    public Result<TicketSlaVO> getTicketSla(@PathVariable Long ticketId) {
        return Result.success(slaService.getTicketSla(ticketId));
    }

    /**
     * 团队 SLA 工单分页查询
     */
    @GetMapping("/sla/tickets")
    @PreAuthorize("hasAnyAuthority('sla:view','sla:manage')")
    public Result<PageResult<SlaTicketVO>> pageSlaTickets(SlaTicketQueryDTO query) {
        return Result.success(slaService.pageSlaTickets(query));
    }

    /**
     * 查询 SLA 规则列表
     */
    @GetMapping("/sla/rules")
    @PreAuthorize("hasAnyAuthority('sla:view','sla:manage')")
    public Result<List<SlaRuleVO>> listRules() {
        return Result.success(slaService.listRules());
    }

    /**
     * 创建 SLA 规则
     */
    @PostMapping("/sla/rules")
    @PreAuthorize("hasAuthority('sla:manage')")
    public Result<Long> createRule(@Valid @RequestBody SlaRuleSaveDTO dto) {
        return Result.success(slaService.createRule(dto));
    }

    /**
     * 修改 SLA 规则
     */
    @PutMapping("/sla/rules/{ruleId}")
    @PreAuthorize("hasAuthority('sla:manage')")
    public Result<Void> updateRule(@PathVariable Long ruleId, @Valid @RequestBody SlaRuleSaveDTO dto) {
        slaService.updateRule(ruleId, dto);
        return Result.success();
    }

    /**
     * 禁用 SLA 规则
     */
    @PostMapping("/sla/rules/{ruleId}/disable")
    @PreAuthorize("hasAuthority('sla:manage')")
    public Result<Void> disableRule(@PathVariable Long ruleId) {
        slaService.disableRule(ruleId);
        return Result.success();
    }
}
