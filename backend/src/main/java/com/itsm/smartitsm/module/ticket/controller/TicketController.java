package com.itsm.smartitsm.module.ticket.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.ticket.dto.CollaborationCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.CommentCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketAssignDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketCancelDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketEscalateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketNudgeDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketProcessDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketQueryDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketRatingCreateDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketRejectDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketResolveDTO;
import com.itsm.smartitsm.module.ticket.dto.TicketTransferDTO;
import com.itsm.smartitsm.module.ticket.service.TicketService;
import com.itsm.smartitsm.module.ticket.vo.CollaborationVO;
import com.itsm.smartitsm.module.ticket.vo.CommentVO;
import com.itsm.smartitsm.module.ticket.vo.TicketAttachmentVO;
import com.itsm.smartitsm.module.ticket.vo.TicketCreateVO;
import com.itsm.smartitsm.module.ticket.vo.TicketDetailVO;
import com.itsm.smartitsm.module.ticket.vo.TicketHistoryVO;
import com.itsm.smartitsm.module.ticket.vo.TicketListVO;
import com.itsm.smartitsm.module.ticket.vo.TicketRatingVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 工单接口，覆盖工单全生命周期、评论、历史、协作与附件
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /**
     * 创建工单
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ticket:create')")
    public Result<TicketCreateVO> create(@Valid @RequestBody TicketCreateDTO dto,
                                         HttpServletRequest request) {
        return Result.success(ticketService.createTicket(dto, resolveClientIp(request)));
    }

    /**
     * 分页查询工单（按数据权限过滤）
     */
    @GetMapping
    public Result<PageResult<TicketListVO>> page(TicketQueryDTO query) {
        return Result.success(ticketService.pageTickets(query));
    }

    /**
     * 查询工单详情
     */
    @GetMapping("/{ticketId}")
    public Result<TicketDetailVO> detail(@PathVariable Long ticketId) {
        return Result.success(ticketService.getTicketDetail(ticketId));
    }

    /**
     * 分配工单（含重新分配，权限码 ticket:assign 或 ticket:reassign）
     */
    @PostMapping("/{ticketId}/assign")
    @PreAuthorize("hasAnyAuthority('ticket:assign','ticket:reassign')")
    public Result<Void> assign(@PathVariable Long ticketId, @Valid @RequestBody TicketAssignDTO dto) {
        ticketService.assign(ticketId, dto);
        return Result.success();
    }

    /**
     * 接受工单
     */
    @PostMapping("/{ticketId}/accept")
    @PreAuthorize("hasAuthority('ticket:accept')")
    public Result<Void> accept(@PathVariable Long ticketId) {
        ticketService.accept(ticketId);
        return Result.success();
    }

    /**
     * 转派工单
     */
    @PostMapping("/{ticketId}/transfer")
    @PreAuthorize("hasAuthority('ticket:transfer')")
    public Result<Void> transfer(@PathVariable Long ticketId, @Valid @RequestBody TicketTransferDTO dto) {
        ticketService.transfer(ticketId, dto);
        return Result.success();
    }

    /**
     * 记录处理过程
     */
    @PostMapping("/{ticketId}/process")
    @PreAuthorize("hasAuthority('ticket:process')")
    public Result<Void> process(@PathVariable Long ticketId, @Valid @RequestBody TicketProcessDTO dto) {
        ticketService.process(ticketId, dto);
        return Result.success();
    }

    /**
     * 提交解决方案
     */
    @PostMapping("/{ticketId}/resolve")
    @PreAuthorize("hasAuthority('ticket:resolve')")
    public Result<Void> resolve(@PathVariable Long ticketId, @Valid @RequestBody TicketResolveDTO dto) {
        ticketService.resolve(ticketId, dto);
        return Result.success();
    }

    /**
     * 用户确认解决
     */
    @PostMapping("/{ticketId}/confirm")
    @PreAuthorize("hasAuthority('ticket:confirm')")
    public Result<Void> confirm(@PathVariable Long ticketId) {
        ticketService.confirm(ticketId);
        return Result.success();
    }

    /**
     * 用户拒绝解决方案
     */
    @PostMapping("/{ticketId}/reject")
    @PreAuthorize("hasAuthority('ticket:confirm')")
    public Result<Void> reject(@PathVariable Long ticketId, @Valid @RequestBody TicketRejectDTO dto) {
        ticketService.reject(ticketId, dto);
        return Result.success();
    }

    /**
     * 取消工单（创建人本人或管理员）
     */
    @PostMapping("/{ticketId}/cancel")
    public Result<Void> cancel(@PathVariable Long ticketId, @RequestBody(required = false) TicketCancelDTO dto) {
        ticketService.cancel(ticketId, dto == null ? new TicketCancelDTO() : dto);
        return Result.success();
    }

    /**
     * 催办工单
     */
    @PostMapping("/{ticketId}/nudge")
    @PreAuthorize("hasAuthority('ticket:nudge')")
    public Result<Void> nudge(@PathVariable Long ticketId,
                               @RequestBody(required = false) TicketNudgeDTO dto) {
        ticketService.nudge(ticketId, dto == null ? new TicketNudgeDTO() : dto);
        return Result.success();
    }

    /**
     * 工单升级
     */
    @PostMapping("/{ticketId}/escalate")
    @PreAuthorize("hasAuthority('ticket:escalate')")
    public Result<Void> escalate(@PathVariable Long ticketId, @Valid @RequestBody TicketEscalateDTO dto) {
        ticketService.escalate(ticketId, dto);
        return Result.success();
    }

    /**
     * 添加评论
     */
    @PostMapping("/{ticketId}/comments")
    @PreAuthorize("hasAuthority('ticket:comment')")
    public Result<Long> addComment(@PathVariable Long ticketId, @Valid @RequestBody CommentCreateDTO dto) {
        return Result.success(ticketService.addComment(ticketId, dto));
    }

    /**
     * 查询评论列表
     */
    @GetMapping("/{ticketId}/comments")
    public Result<List<CommentVO>> listComments(@PathVariable Long ticketId) {
        return Result.success(ticketService.listComments(ticketId));
    }

    /**
     * 查询工单操作历史
     */
    @GetMapping("/{ticketId}/history")
    public Result<List<TicketHistoryVO>> listHistory(@PathVariable Long ticketId) {
        return Result.success(ticketService.listHistory(ticketId));
    }

    /**
     * 发起协作
     */
    @PostMapping("/{ticketId}/collaborations")
    @PreAuthorize("hasAuthority('ticket:collaborate')")
    public Result<Long> createCollaboration(@PathVariable Long ticketId,
                                            @Valid @RequestBody CollaborationCreateDTO dto) {
        return Result.success(ticketService.createCollaboration(ticketId, dto));
    }

    /**
     * 查询协作记录
     */
    @GetMapping("/{ticketId}/collaborations")
    public Result<List<CollaborationVO>> listCollaborations(@PathVariable Long ticketId) {
        return Result.success(ticketService.listCollaborations(ticketId));
    }

    /**
     * 接受协作（仅协作人本人）
     */
    @PostMapping("/{ticketId}/collaborations/{collaborationId}/accept")
    public Result<Void> acceptCollaboration(@PathVariable Long ticketId,
                                            @PathVariable Long collaborationId) {
        ticketService.acceptCollaboration(ticketId, collaborationId);
        return Result.success();
    }

    /**
     * 完成协作（仅协作人本人）
     */
    @PostMapping("/{ticketId}/collaborations/{collaborationId}/complete")
    public Result<Void> completeCollaboration(@PathVariable Long ticketId,
                                              @PathVariable Long collaborationId) {
        ticketService.completeCollaboration(ticketId, collaborationId);
        return Result.success();
    }

    /**
     * 上传附件
     */
    @PostMapping("/{ticketId}/attachments")
    @PreAuthorize("hasAuthority('ticket:attachment')")
    public Result<TicketAttachmentVO> uploadAttachment(@PathVariable Long ticketId,
                                                       @RequestParam("file") MultipartFile file) {
        return Result.success(ticketService.uploadAttachment(ticketId, file));
    }

    /**
     * 查询附件列表
     */
    @GetMapping("/{ticketId}/attachments")
    public Result<List<TicketAttachmentVO>> listAttachments(@PathVariable Long ticketId) {
        return Result.success(ticketService.listAttachments(ticketId));
    }

    /**
     * 删除附件
     */
    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    @PreAuthorize("hasAuthority('ticket:attachment')")
    public Result<Void> deleteAttachment(@PathVariable Long ticketId,
                                         @PathVariable Long attachmentId) {
        ticketService.deleteAttachment(ticketId, attachmentId);
        return Result.success();
    }

    /**
     * 评价工单（仅工单创建人，且工单已关闭）
     */
    @PostMapping("/{ticketId}/rating")
    @PreAuthorize("hasAuthority('ticket:rate')")
    public Result<Void> rate(@PathVariable Long ticketId,
                             @Valid @RequestBody TicketRatingCreateDTO dto) {
        ticketService.rateTicket(ticketId, dto);
        return Result.success();
    }

    /**
     * 查询工单评价
     */
    @GetMapping("/{ticketId}/rating")
    @PreAuthorize("hasAuthority('ticket:rate')")
    public Result<TicketRatingVO> getRating(@PathVariable Long ticketId) {
        return Result.success(ticketService.getRating(ticketId));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }
        ip = request.getHeader("X-Real-IP");
        return (ip != null && !ip.isEmpty()) ? ip : request.getRemoteAddr();
    }
}
