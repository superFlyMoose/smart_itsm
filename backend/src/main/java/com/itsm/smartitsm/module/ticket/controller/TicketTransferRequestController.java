package com.itsm.smartitsm.module.ticket.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.ticket.dto.TicketTransferRequestAuditDTO;
import com.itsm.smartitsm.module.ticket.service.TicketTransferRequestService;
import com.itsm.smartitsm.module.ticket.vo.TicketTransferRequestVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 工单跨团队转派申请接口，覆盖审批流程：查询/审批/拒绝/撤销。
 * <p>
 * 转派申请由工单转派入口 {@code POST /api/v1/tickets/{ticketId}/transfer}
 * 在判定为跨团队时自动发起，本接口不提供独立的发起入口。
 */
@RestController
@RequestMapping("/api/v1/transfer-requests")
@RequiredArgsConstructor
public class TicketTransferRequestController {

    private final TicketTransferRequestService ticketTransferRequestService;

    /**
     * 分页查询转派申请（数据权限：发起人/目标团队负责人/管理员）
     */
    @GetMapping
    public Result<PageResult<TicketTransferRequestVO>> page(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long ticketId,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {
        return Result.success(ticketTransferRequestService.pageRequests(
                status, ticketId, pageNum, pageSize));
    }

    /**
     * 查询转派申请详情
     */
    @GetMapping("/{id}")
    public Result<TicketTransferRequestVO> detail(@PathVariable Long id) {
        return Result.success(ticketTransferRequestService.getRequestDetail(id));
    }

    /**
     * 审批通过（仅目标团队负责人/管理员，由服务层校验团队负责人身份）。审批通过后实际执行工单转移。
     */
    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id,
                                @Valid @RequestBody(required = false) TicketTransferRequestAuditDTO dto) {
        ticketTransferRequestService.approve(id, dto == null ? new TicketTransferRequestAuditDTO() : dto);
        return Result.success();
    }

    /**
     * 审批拒绝（仅目标团队负责人/管理员，由服务层校验团队负责人身份）
     */
    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id,
                               @Valid @RequestBody(required = false) TicketTransferRequestAuditDTO dto) {
        ticketTransferRequestService.reject(id, dto == null ? new TicketTransferRequestAuditDTO() : dto);
        return Result.success();
    }

    /**
     * 撤销转派申请（仅发起人/管理员）
     */
    @PostMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id,
                               @RequestBody(required = false) TicketTransferRequestAuditDTO dto) {
        ticketTransferRequestService.cancel(id, dto == null ? new TicketTransferRequestAuditDTO() : dto);
        return Result.success();
    }
}
