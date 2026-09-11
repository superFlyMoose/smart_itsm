package com.itsm.smartitsm.module.ticket.service;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.module.ticket.dto.TicketTransferRequestAuditDTO;
import com.itsm.smartitsm.module.ticket.vo.TicketTransferRequestVO;

/**
 * 工单跨团队转派申请服务
 * <p>
 * 跨团队转派需目标团队负责人审批通过后才执行工单转移；
 * 同团队转派直接由 {@link TicketService#transfer} 完成，不经过本服务。
 */
public interface TicketTransferRequestService {

    /**
     * 发起跨团队转派申请（由工单转派入口在判定为跨团队时委托调用）。
     * 工单当前团队必须存在，且目标团队必须与当前团队不同。
     *
     * @return 转派申请ID
     */
    Long createRequest(Long ticketId, Long targetTeamId, Long targetAssigneeId, String reason);

    /**
     * 分页查询转派申请（数据权限：发起人/目标团队负责人/管理员）
     */
    PageResult<TicketTransferRequestVO> pageRequests(String status, Long ticketId,
                                                    Integer pageNum, Integer pageSize);

    /**
     * 查询转派申请详情
     */
    TicketTransferRequestVO getRequestDetail(Long id);

    /**
     * 审批通过（仅目标团队负责人/管理员）。审批通过后实际执行工单转移。
     */
    void approve(Long id, TicketTransferRequestAuditDTO dto);

    /**
     * 审批拒绝（仅目标团队负责人/管理员）
     */
    void reject(Long id, TicketTransferRequestAuditDTO dto);

    /**
     * 撤销转派申请（仅发起人/管理员）
     */
    void cancel(Long id, TicketTransferRequestAuditDTO dto);
}
