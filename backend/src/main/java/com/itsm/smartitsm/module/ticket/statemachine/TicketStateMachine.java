package com.itsm.smartitsm.module.ticket.statemachine;

import com.itsm.smartitsm.common.enums.TicketActionEnum;
import com.itsm.smartitsm.common.enums.TicketStatusEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

/**
 * 工单状态机，集中维护状态流转规则，避免各 Controller/Service 分散判断
 */
@Component
public class TicketStateMachine {

    /**
     * 状态流转表：动作 -> (当前状态 -> 目标状态)
     */
    private final Map<TicketActionEnum, Map<TicketStatusEnum, TicketStatusEnum>> transitions =
            new EnumMap<>(TicketActionEnum.class);

    public TicketStateMachine() {
        // OPEN -> ASSIGNED；重新分配 ASSIGNED -> ASSIGNED
        register(TicketActionEnum.ASSIGN, TicketStatusEnum.OPEN, TicketStatusEnum.ASSIGNED);
        register(TicketActionEnum.ASSIGN, TicketStatusEnum.ASSIGNED, TicketStatusEnum.ASSIGNED);

        // ASSIGNED -> PROCESSING
        register(TicketActionEnum.ACCEPT, TicketStatusEnum.ASSIGNED, TicketStatusEnum.PROCESSING);

        // 转派后新工程师需要重新接受
        register(TicketActionEnum.TRANSFER, TicketStatusEnum.ASSIGNED, TicketStatusEnum.ASSIGNED);
        register(TicketActionEnum.TRANSFER, TicketStatusEnum.PROCESSING, TicketStatusEnum.ASSIGNED);

        // 处理过程不改变状态
        register(TicketActionEnum.PROCESS, TicketStatusEnum.PROCESSING, TicketStatusEnum.PROCESSING);

        // 发起协作
        register(TicketActionEnum.COLLABORATE, TicketStatusEnum.PROCESSING,
                TicketStatusEnum.WAITING_COLLABORATION);

        // 全部协作完成，回到处理中
        register(TicketActionEnum.COLLABORATION_COMPLETE, TicketStatusEnum.WAITING_COLLABORATION,
                TicketStatusEnum.PROCESSING);

        // 提交解决方案
        register(TicketActionEnum.RESOLVE, TicketStatusEnum.PROCESSING,
                TicketStatusEnum.WAITING_CONFIRM);

        // 用户拒绝解决方案
        register(TicketActionEnum.REJECT_RESOLUTION, TicketStatusEnum.WAITING_CONFIRM,
                TicketStatusEnum.PROCESSING);

        // 用户确认解决
        register(TicketActionEnum.CLOSE, TicketStatusEnum.WAITING_CONFIRM, TicketStatusEnum.CLOSED);

        // 取消（非终态均可取消）
        register(TicketActionEnum.CANCEL, TicketStatusEnum.OPEN, TicketStatusEnum.CANCELLED);
        register(TicketActionEnum.CANCEL, TicketStatusEnum.ASSIGNED, TicketStatusEnum.CANCELLED);
        register(TicketActionEnum.CANCEL, TicketStatusEnum.PROCESSING, TicketStatusEnum.CANCELLED);
        register(TicketActionEnum.CANCEL, TicketStatusEnum.WAITING_COLLABORATION,
                TicketStatusEnum.CANCELLED);

        // 升级、催办不改变状态
        register(TicketActionEnum.ESCALATE, TicketStatusEnum.ASSIGNED, TicketStatusEnum.ASSIGNED);
        register(TicketActionEnum.ESCALATE, TicketStatusEnum.PROCESSING, TicketStatusEnum.PROCESSING);
        register(TicketActionEnum.ESCALATE, TicketStatusEnum.WAITING_COLLABORATION,
                TicketStatusEnum.WAITING_COLLABORATION);
        register(TicketActionEnum.ESCALATE, TicketStatusEnum.WAITING_CONFIRM,
                TicketStatusEnum.WAITING_CONFIRM);
        register(TicketActionEnum.NUDGE, TicketStatusEnum.OPEN, TicketStatusEnum.OPEN);
        register(TicketActionEnum.NUDGE, TicketStatusEnum.ASSIGNED, TicketStatusEnum.ASSIGNED);
        register(TicketActionEnum.NUDGE, TicketStatusEnum.PROCESSING, TicketStatusEnum.PROCESSING);
        register(TicketActionEnum.NUDGE, TicketStatusEnum.WAITING_COLLABORATION,
                TicketStatusEnum.WAITING_COLLABORATION);
        register(TicketActionEnum.NUDGE, TicketStatusEnum.WAITING_CONFIRM,
                TicketStatusEnum.WAITING_CONFIRM);
    }

    private void register(TicketActionEnum action, TicketStatusEnum from, TicketStatusEnum to) {
        transitions.computeIfAbsent(action, key -> new EnumMap<>(TicketStatusEnum.class)).put(from, to);
    }

    /**
     * 校验当前状态是否允许执行指定动作，允许则返回目标状态
     *
     * @throws BusinessException 不允许流转时抛出 B0002
     */
    public TicketStatusEnum validateTransition(TicketStatusEnum current, TicketActionEnum action) {
        Map<TicketStatusEnum, TicketStatusEnum> actionTransitions = transitions.get(action);
        TicketStatusEnum target = actionTransitions == null ? null : actionTransitions.get(current);
        if (target == null) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR,
                    "工单当前状态[" + current.getStatusName() + "]不允许执行该操作");
        }
        return target;
    }
}
