package com.itsm.smartitsm.common.result;

/**
 * 业务返回码枚举
 */
public enum ResultCode {

    SUCCESS("00000", "success"),
    PARAM_ERROR("A0001", "参数错误"),
    NOT_FOUND("A0002", "请求数据不存在"),
    DATA_DUPLICATED("A0003", "数据重复"),
    VALIDATE_FAILED("A0004", "参数校验失败"),
    UNAUTHORIZED("A0005", "未登录或登录已过期"),
    FORBIDDEN("A0006", "无权限访问"),

    TICKET_NOT_FOUND("B0001", "工单不存在"),
    TICKET_STATUS_ERROR("B0002", "工单状态不允许执行该操作"),
    NOT_TICKET_CREATOR("B0003", "非工单创建人"),
    NOT_TICKET_ASSIGNEE("B0004", "非当前处理人"),
    TICKET_CLOSED("B0005", "工单已关闭"),
    TICKET_CANCELLED("B0006", "工单已取消"),
    TICKET_ASSIGN_FAILED("B0007", "工单分配失败"),
    TICKET_TRANSFER_FAILED("B0008", "工单转派失败"),
    COLLABORATION_NOT_FOUND("B0009", "协作任务不存在"),
    COLLABORATION_STATUS_ERROR("B0010", "协作任务状态错误"),
    TRANSFER_REQUEST_NOT_FOUND("B0011", "转派申请不存在"),
    TRANSFER_REQUEST_STATUS_ERROR("B0012", "转派申请状态不允许执行该操作"),
    NOT_TRANSFER_REQUEST_REQUESTER("B0013", "非转派申请发起人"),
    NOT_TRANSFER_REQUEST_APPROVER("B0014", "非转派申请审批人"),
    TRANSFER_REQUEST_TICKET_TEAM_SAME("B0015", "目标团队与当前团队相同，无需跨团队转派"),

    SLA_RULE_NOT_FOUND("C0001", "SLA规则不存在"),
    SLA_CONFIG_ERROR("C0002", "SLA配置错误"),

    USER_NOT_FOUND("D0001", "用户不存在"),
    USER_DISABLED("D0002", "用户已禁用"),
    USERNAME_EXISTS("D0003", "用户名已存在"),

    AI_TASK_NOT_FOUND("E0001", "AI任务不存在"),
    AI_TASK_FAILED("E0002", "AI任务执行失败"),

    SYSTEM_ERROR("S0001", "系统内部异常");

    private final String code;
    private final String message;

    ResultCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
