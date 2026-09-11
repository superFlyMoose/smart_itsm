-- 跨团队转派申请表（新增）
CREATE TABLE IF NOT EXISTS ticket_transfer_request (
                                        id BIGINT NOT NULL AUTO_INCREMENT COMMENT '转派申请ID',
                                        ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                        requester_id BIGINT NOT NULL COMMENT '发起人ID（原团队负责人/工程师/管理员）',

                                        from_team_id BIGINT NOT NULL COMMENT '原团队ID',
                                        to_team_id BIGINT NOT NULL COMMENT '目标团队ID',
                                        target_assignee_id BIGINT NOT NULL COMMENT '目标工程师ID',

                                        reason VARCHAR(500) DEFAULT NULL COMMENT '转派原因',

                                        status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                            COMMENT '状态：PENDING/APPROVED/REJECTED/CANCELLED',

                                        approver_id BIGINT DEFAULT NULL COMMENT '审批人ID（目标团队负责人）',
                                        approve_remark VARCHAR(500) DEFAULT NULL COMMENT '审批意见',
                                        approved_at DATETIME DEFAULT NULL COMMENT '审批时间',
                                        executed_at DATETIME DEFAULT NULL COMMENT '执行转移时间（审批通过后实际转移工单）',

                                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                                        PRIMARY KEY (id),
                                        KEY idx_ticket_id (ticket_id),
                                        KEY idx_requester_id (requester_id),
                                        KEY idx_to_team_id (to_team_id),
                                        KEY idx_status (status),

                                        CONSTRAINT fk_transfer_request_ticket
                                            FOREIGN KEY (ticket_id)
                                                REFERENCES ticket(id),

                                        CONSTRAINT fk_transfer_request_requester
                                            FOREIGN KEY (requester_id)
                                                REFERENCES sys_user(id),

                                        CONSTRAINT fk_transfer_request_from_team
                                            FOREIGN KEY (from_team_id)
                                                REFERENCES sys_team(id),

                                        CONSTRAINT fk_transfer_request_to_team
                                            FOREIGN KEY (to_team_id)
                                                REFERENCES sys_team(id),

                                        CONSTRAINT fk_transfer_request_assignee
                                            FOREIGN KEY (target_assignee_id)
                                                REFERENCES sys_user(id),

                                        CONSTRAINT fk_transfer_request_approver
                                            FOREIGN KEY (approver_id)
                                                REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单跨团队转派申请表';

-- 新增转派审批权限（如已存在则跳过）
INSERT IGNORE INTO sys_permission (id, permission_code, permission_name, description)
VALUES (28, 'ticket:transfer:approve', '审批转派', '审批跨团队工单转派申请');

-- 授予 TEAM_MANAGER 角色转派审批权限（如已存在则跳过）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
VALUES (3, 28);
