package com.itsm.smartitsm.module.ticket.service;

import com.itsm.smartitsm.common.result.PageResult;
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
import com.itsm.smartitsm.module.ticket.vo.CollaborationVO;
import com.itsm.smartitsm.module.ticket.vo.CommentVO;
import com.itsm.smartitsm.module.ticket.vo.TicketAttachmentVO;
import com.itsm.smartitsm.module.ticket.vo.TicketCreateVO;
import com.itsm.smartitsm.module.ticket.vo.TicketDetailVO;
import com.itsm.smartitsm.module.ticket.vo.TicketHistoryVO;
import com.itsm.smartitsm.module.ticket.vo.TicketListVO;
import com.itsm.smartitsm.module.ticket.vo.TicketRatingVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 工单服务，覆盖工单全生命周期及评论、历史、协作、附件
 */
public interface TicketService {

    /**
     * 创建工单
     */
    TicketCreateVO createTicket(TicketCreateDTO dto, String clientIp);

    /**
     * 分页查询工单（带数据权限）
     */
    PageResult<TicketListVO> pageTickets(TicketQueryDTO query);

    /**
     * 查询工单详情（带数据权限校验）
     */
    TicketDetailVO getTicketDetail(Long ticketId);

    /**
     * 分配工单
     */
    void assign(Long ticketId, TicketAssignDTO dto);

    /**
     * 接受工单
     */
    void accept(Long ticketId);

    /**
     * 转派工单
     */
    void transfer(Long ticketId, TicketTransferDTO dto);

    /**
     * 记录处理过程
     */
    void process(Long ticketId, TicketProcessDTO dto);

    /**
     * 提交解决方案
     */
    void resolve(Long ticketId, TicketResolveDTO dto);

    /**
     * 用户确认解决
     */
    void confirm(Long ticketId);

    /**
     * 用户拒绝解决方案
     */
    void reject(Long ticketId, TicketRejectDTO dto);

    /**
     * 取消工单
     */
    void cancel(Long ticketId, TicketCancelDTO dto);

    /**
     * 催办工单
     */
    void nudge(Long ticketId, TicketNudgeDTO dto);

    /**
     * 工单升级
     */
    void escalate(Long ticketId, TicketEscalateDTO dto);

    /**
     * 添加评论
     */
    Long addComment(Long ticketId, CommentCreateDTO dto);

    /**
     * 查询评论列表
     */
    List<CommentVO> listComments(Long ticketId);

    /**
     * 查询工单操作历史
     */
    List<TicketHistoryVO> listHistory(Long ticketId);

    /**
     * 发起协作
     */
    Long createCollaboration(Long ticketId, CollaborationCreateDTO dto);

    /**
     * 查询协作记录
     */
    List<CollaborationVO> listCollaborations(Long ticketId);

    /**
     * 接受协作
     */
    void acceptCollaboration(Long ticketId, Long collaborationId);

    /**
     * 完成协作
     */
    void completeCollaboration(Long ticketId, Long collaborationId);

    /**
     * 上传附件
     */
    TicketAttachmentVO uploadAttachment(Long ticketId, MultipartFile file);

    /**
     * 查询附件列表
     */
    List<TicketAttachmentVO> listAttachments(Long ticketId);

    /**
     * 删除附件
     */
    void deleteAttachment(Long ticketId, Long attachmentId);

    /**
     * 评价工单（仅工单创建人，且工单已关闭）
     */
    void rateTicket(Long ticketId, TicketRatingCreateDTO dto);

    /**
     * 查询工单评价（不存在返回 null）
     */
    TicketRatingVO getRating(Long ticketId);
}
