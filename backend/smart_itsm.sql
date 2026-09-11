-- ============================================================================
-- Smart-ITSM 数据库初始化脚本（幂等，可重复执行）
-- MySQL 8.0+
-- 用法：mysql -uroot -p < smart_itsm.sql
-- 默认演示账号密码均为 123456（BCrypt）
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smart_itsm
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE smart_itsm;

-- 幂等执行：临时关闭外键检查与唯一检查，避免建表/种子数据顺序依赖
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 一、建表
-- ============================================================================

-- 1. 部门
CREATE TABLE IF NOT EXISTS sys_department (
                                id BIGINT NOT NULL AUTO_INCREMENT COMMENT '部门ID',
                                name VARCHAR(100) NOT NULL COMMENT '部门名称',
                                parent_id BIGINT DEFAULT NULL COMMENT '父部门ID',
                                manager_id BIGINT DEFAULT NULL COMMENT '部门负责人ID',
                                status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                                PRIMARY KEY (id),
                                KEY idx_parent_id (parent_id),
                                KEY idx_manager_id (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 2. 用户
CREATE TABLE IF NOT EXISTS sys_user (
                          id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
                          username VARCHAR(50) NOT NULL COMMENT '登录账号',
                          password VARCHAR(255) NOT NULL COMMENT '密码（BCrypt）',
                          employee_no VARCHAR(50) NOT NULL COMMENT '员工编号',
                          real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
                          department_id BIGINT DEFAULT NULL COMMENT '所属部门ID',
                          position VARCHAR(100) DEFAULT NULL COMMENT '职位',
                          phone VARCHAR(30) DEFAULT NULL COMMENT '手机号',
                          email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
                          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                          PRIMARY KEY (id),
                          UNIQUE KEY uk_username (username),
                          UNIQUE KEY uk_employee_no (employee_no),
                          KEY idx_department_id (department_id),

                          CONSTRAINT fk_user_department
                              FOREIGN KEY (department_id)
                                  REFERENCES sys_department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 3. IT服务团队
CREATE TABLE IF NOT EXISTS sys_team (
                          id BIGINT NOT NULL AUTO_INCREMENT COMMENT '团队ID',
                          name VARCHAR(100) NOT NULL COMMENT '团队名称',
                          department_id BIGINT NOT NULL COMMENT '所属部门ID',
                          manager_id BIGINT DEFAULT NULL COMMENT '团队负责人ID',
                          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                          PRIMARY KEY (id),
                          KEY idx_department_id (department_id),
                          KEY idx_manager_id (manager_id),

                          CONSTRAINT fk_team_department
                              FOREIGN KEY (department_id)
                                  REFERENCES sys_department(id),

                          CONSTRAINT fk_team_manager
                              FOREIGN KEY (manager_id)
                                  REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IT服务团队表';

-- 4. 团队成员
CREATE TABLE IF NOT EXISTS sys_team_member (
                                 id BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                                 team_id BIGINT NOT NULL COMMENT '团队ID',
                                 user_id BIGINT NOT NULL COMMENT '用户ID',
                                 team_role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' COMMENT '团队身份：MEMBER/LEADER',
                                 joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',

                                 PRIMARY KEY (id),
                                 UNIQUE KEY uk_team_user (team_id, user_id),
                                 KEY idx_user_id (user_id),

                                 CONSTRAINT fk_team_member_team
                                     FOREIGN KEY (team_id)
                                         REFERENCES sys_team(id),

                                 CONSTRAINT fk_team_member_user
                                     FOREIGN KEY (user_id)
                                         REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团队成员关系表';

-- 5. 角色
CREATE TABLE IF NOT EXISTS sys_role (
                          id BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
                          role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
                          role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
                          description VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                          PRIMARY KEY (id),
                          UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 6. 权限
CREATE TABLE IF NOT EXISTS sys_permission (
                                id BIGINT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
                                permission_code VARCHAR(100) NOT NULL COMMENT '权限编码',
                                permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
                                description VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                                PRIMARY KEY (id),
                                UNIQUE KEY uk_permission_code (permission_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限表';

-- 7. 用户-角色关系
CREATE TABLE IF NOT EXISTS sys_user_role (
                               id BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                               user_id BIGINT NOT NULL COMMENT '用户ID',
                               role_id BIGINT NOT NULL COMMENT '角色ID',

                               PRIMARY KEY (id),
                               UNIQUE KEY uk_user_role (user_id, role_id),
                               KEY idx_role_id (role_id),

                               CONSTRAINT fk_user_role_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES sys_user(id),

                               CONSTRAINT fk_user_role_role
                                   FOREIGN KEY (role_id)
                                       REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关系表';

-- 8. 角色-权限关系
CREATE TABLE IF NOT EXISTS sys_role_permission (
                                     id BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                                     role_id BIGINT NOT NULL COMMENT '角色ID',
                                     permission_id BIGINT NOT NULL COMMENT '权限ID',

                                     PRIMARY KEY (id),
                                     UNIQUE KEY uk_role_permission (role_id, permission_id),
                                     KEY idx_permission_id (permission_id),

                                     CONSTRAINT fk_role_permission_role
                                         FOREIGN KEY (role_id)
                                             REFERENCES sys_role(id),

                                     CONSTRAINT fk_role_permission_permission
                                         FOREIGN KEY (permission_id)
                                             REFERENCES sys_permission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关系表';

-- 9. 工单分类
CREATE TABLE IF NOT EXISTS ticket_category (
                                 id BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
                                 name VARCHAR(100) NOT NULL COMMENT '分类名称',
                                 parent_id BIGINT DEFAULT NULL COMMENT '父分类ID',
                                 description VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
                                 status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
                                 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                                 PRIMARY KEY (id),
                                 KEY idx_parent_id (parent_id),
                                 KEY idx_status (status),

                                 CONSTRAINT fk_category_parent
                                     FOREIGN KEY (parent_id)
                                         REFERENCES ticket_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单分类表';

-- 10. 工单主表
CREATE TABLE IF NOT EXISTS ticket (
                        id BIGINT NOT NULL AUTO_INCREMENT COMMENT '工单ID',
                        ticket_no VARCHAR(32) NOT NULL COMMENT '工单编号',

                        title VARCHAR(200) NOT NULL COMMENT '工单标题',
                        description TEXT NOT NULL COMMENT '问题描述',

                        creator_id BIGINT NOT NULL COMMENT '创建人ID',
                        department_id BIGINT DEFAULT NULL COMMENT '创建人部门ID',

                        team_id BIGINT DEFAULT NULL COMMENT '当前负责团队ID',
                        assignee_id BIGINT DEFAULT NULL COMMENT '当前处理人ID',

                        category_id BIGINT DEFAULT NULL COMMENT '工单分类ID',

                        priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
                            COMMENT '优先级：URGENT/HIGH/MEDIUM/LOW',

                        status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
                            COMMENT '状态：OPEN/ASSIGNED/PROCESSING/WAITING_COLLABORATION/WAITING_CONFIRM/CLOSED/CANCELLED',

                        client_ip VARCHAR(50) DEFAULT NULL COMMENT '提交时客户端IP',

                        first_response_at DATETIME DEFAULT NULL COMMENT '首次响应时间',
                        resolved_at DATETIME DEFAULT NULL COMMENT '解决时间',
                        closed_at DATETIME DEFAULT NULL COMMENT '关闭时间',

                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                        PRIMARY KEY (id),
                        UNIQUE KEY uk_ticket_no (ticket_no),

                        KEY idx_creator_id (creator_id),
                        KEY idx_department_id (department_id),
                        KEY idx_team_id (team_id),
                        KEY idx_assignee_id (assignee_id),
                        KEY idx_category_id (category_id),
                        KEY idx_status (status),
                        KEY idx_priority (priority),
                        KEY idx_created_at (created_at),

                        CONSTRAINT fk_ticket_creator
                            FOREIGN KEY (creator_id)
                                REFERENCES sys_user(id),

                        CONSTRAINT fk_ticket_department
                            FOREIGN KEY (department_id)
                                REFERENCES sys_department(id),

                        CONSTRAINT fk_ticket_team
                            FOREIGN KEY (team_id)
                                REFERENCES sys_team(id),

                        CONSTRAINT fk_ticket_assignee
                            FOREIGN KEY (assignee_id)
                                REFERENCES sys_user(id),

                        CONSTRAINT fk_ticket_category
                            FOREIGN KEY (category_id)
                                REFERENCES ticket_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IT服务工单主表';

-- 11. 工单评论
CREATE TABLE IF NOT EXISTS ticket_comment (
                                id BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
                                ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                user_id BIGINT NOT NULL COMMENT '评论人ID',
                                content TEXT NOT NULL COMMENT '评论内容',
                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                                PRIMARY KEY (id),
                                KEY idx_ticket_id (ticket_id),
                                KEY idx_user_id (user_id),
                                KEY idx_created_at (created_at),

                                CONSTRAINT fk_comment_ticket
                                    FOREIGN KEY (ticket_id)
                                        REFERENCES ticket(id),

                                CONSTRAINT fk_comment_user
                                    FOREIGN KEY (user_id)
                                        REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单评论表';

-- 12. 工单操作历史
CREATE TABLE IF NOT EXISTS ticket_history (
                                id BIGINT NOT NULL AUTO_INCREMENT COMMENT '历史记录ID',
                                ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                operator_id BIGINT NOT NULL COMMENT '操作人ID',

                                action VARCHAR(50) NOT NULL COMMENT '操作类型',
                                from_status VARCHAR(30) DEFAULT NULL COMMENT '原状态',
                                to_status VARCHAR(30) DEFAULT NULL COMMENT '新状态',
                                remark VARCHAR(500) DEFAULT NULL COMMENT '操作说明',

                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

                                PRIMARY KEY (id),
                                KEY idx_ticket_id (ticket_id),
                                KEY idx_operator_id (operator_id),
                                KEY idx_created_at (created_at),

                                CONSTRAINT fk_history_ticket
                                    FOREIGN KEY (ticket_id)
                                        REFERENCES ticket(id),

                                CONSTRAINT fk_history_operator
                                    FOREIGN KEY (operator_id)
                                        REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单操作历史表';

-- 13. 工单协作
CREATE TABLE IF NOT EXISTS ticket_collaboration (
                                      id BIGINT NOT NULL AUTO_INCREMENT COMMENT '协作记录ID',
                                      ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                      requester_id BIGINT NOT NULL COMMENT '发起协作人ID',
                                      collaborator_id BIGINT NOT NULL COMMENT '协作人ID',

                                      message VARCHAR(500) DEFAULT NULL COMMENT '协作说明',

                                      status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                          COMMENT '状态：PENDING/PROCESSING/COMPLETED/CANCELLED',

                                      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                      completed_at DATETIME DEFAULT NULL COMMENT '完成时间',

                                      PRIMARY KEY (id),
                                      KEY idx_ticket_id (ticket_id),
                                      KEY idx_requester_id (requester_id),
                                      KEY idx_collaborator_id (collaborator_id),
                                      KEY idx_status (status),

                                      CONSTRAINT fk_collaboration_ticket
                                          FOREIGN KEY (ticket_id)
                                              REFERENCES ticket(id),

                                      CONSTRAINT fk_collaboration_requester
                                          FOREIGN KEY (requester_id)
                                              REFERENCES sys_user(id),

                                      CONSTRAINT fk_collaboration_collaborator
                                          FOREIGN KEY (collaborator_id)
                                              REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单协作表';

-- 14. 工单附件
CREATE TABLE IF NOT EXISTS ticket_attachment (
                                   id BIGINT NOT NULL AUTO_INCREMENT COMMENT '附件ID',
                                   ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                   uploader_id BIGINT NOT NULL COMMENT '上传人ID',

                                   file_name VARCHAR(255) NOT NULL COMMENT '文件名称',
                                   file_url VARCHAR(500) NOT NULL COMMENT '文件地址',
                                   file_size BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
                                   content_type VARCHAR(100) DEFAULT NULL COMMENT '文件类型',

                                   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',

                                   PRIMARY KEY (id),
                                   KEY idx_ticket_id (ticket_id),
                                   KEY idx_uploader_id (uploader_id),

                                   CONSTRAINT fk_attachment_ticket
                                       FOREIGN KEY (ticket_id)
                                           REFERENCES ticket(id),

                                   CONSTRAINT fk_attachment_uploader
                                       FOREIGN KEY (uploader_id)
                                           REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单附件表';

-- 15. 工单评价
CREATE TABLE IF NOT EXISTS ticket_rating (
                                 id BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
                                 ticket_id BIGINT NOT NULL COMMENT '工单ID',
                                 user_id BIGINT NOT NULL COMMENT '评价人ID',

                                 score TINYINT NOT NULL COMMENT '评分：1-5星',
                                 comment VARCHAR(500) DEFAULT NULL COMMENT '评价内容',

                                 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',

                                 PRIMARY KEY (id),
                                 UNIQUE KEY uk_ticket_user (ticket_id, user_id),
                                 KEY idx_ticket_id (ticket_id),
                                 KEY idx_user_id (user_id),

                                 CONSTRAINT fk_rating_ticket
                                     FOREIGN KEY (ticket_id)
                                         REFERENCES ticket(id),

                                 CONSTRAINT fk_rating_user
                                     FOREIGN KEY (user_id)
                                         REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单评价表';

-- 16. 跨团队转派申请
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

-- 17. SLA规则
CREATE TABLE IF NOT EXISTS sla_rule (
                          id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'SLA规则ID',
                          name VARCHAR(100) NOT NULL COMMENT '规则名称',

                          priority VARCHAR(20) NOT NULL COMMENT '对应优先级',

                          response_minutes INT NOT NULL COMMENT '首次响应时限（分钟）',
                          resolve_minutes INT NOT NULL COMMENT '解决时限（分钟）',
                          escalation_minutes INT DEFAULT NULL COMMENT '升级时限（分钟）',

                          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',

                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                          PRIMARY KEY (id),
                          KEY idx_priority (priority),
                          KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SLA规则表';

-- 18. 工单SLA实例
CREATE TABLE IF NOT EXISTS ticket_sla (
                            id BIGINT NOT NULL AUTO_INCREMENT COMMENT '工单SLA ID',
                            ticket_id BIGINT NOT NULL COMMENT '工单ID',
                            rule_id BIGINT NOT NULL COMMENT 'SLA规则ID',

                            response_deadline DATETIME NOT NULL COMMENT '响应截止时间',
                            resolve_deadline DATETIME NOT NULL COMMENT '解决截止时间',

                            first_response_at DATETIME DEFAULT NULL COMMENT '实际首次响应时间',
                            resolved_at DATETIME DEFAULT NULL COMMENT '实际解决时间',

                            response_breached TINYINT NOT NULL DEFAULT 0 COMMENT '是否响应超时',
                            resolve_breached TINYINT NOT NULL DEFAULT 0 COMMENT '是否解决超时',

                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                            PRIMARY KEY (id),
                            UNIQUE KEY uk_ticket_id (ticket_id),
                            KEY idx_response_deadline (response_deadline),
                            KEY idx_resolve_deadline (resolve_deadline),

                            CONSTRAINT fk_ticket_sla_ticket
                                FOREIGN KEY (ticket_id)
                                    REFERENCES ticket(id),

                            CONSTRAINT fk_ticket_sla_rule
                                FOREIGN KEY (rule_id)
                                    REFERENCES sla_rule(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单SLA实例表';

-- 19. 系统通知
CREATE TABLE IF NOT EXISTS notification (
                              id BIGINT NOT NULL AUTO_INCREMENT COMMENT '通知ID',
                              user_id BIGINT NOT NULL COMMENT '接收用户ID',

                              type VARCHAR(50) NOT NULL COMMENT '通知类型',
                              title VARCHAR(200) NOT NULL COMMENT '通知标题',
                              content VARCHAR(1000) NOT NULL COMMENT '通知内容',

                              related_type VARCHAR(50) DEFAULT NULL COMMENT '关联业务类型',
                              related_id BIGINT DEFAULT NULL COMMENT '关联业务ID',

                              is_read TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0未读 1已读',

                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                              PRIMARY KEY (id),
                              KEY idx_user_read (user_id, is_read),
                              KEY idx_related (related_type, related_id),
                              KEY idx_created_at (created_at),

                              CONSTRAINT fk_notification_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- 20. 知识库文档
CREATE TABLE IF NOT EXISTS knowledge_document (
                                    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '文档ID',
                                    title VARCHAR(255) NOT NULL COMMENT '文档标题',
                                    file_url VARCHAR(500) DEFAULT NULL COMMENT '文档地址',
                                    category_id BIGINT DEFAULT NULL COMMENT '分类ID',
                                    uploader_id BIGINT NOT NULL COMMENT '上传人ID',

                                    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'
                                        COMMENT '状态：DRAFT/PUBLISHED/OFFLINE',

                                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

                                    PRIMARY KEY (id),
                                    KEY idx_category_id (category_id),
                                    KEY idx_uploader_id (uploader_id),
                                    KEY idx_status (status),

                                    CONSTRAINT fk_knowledge_uploader
                                        FOREIGN KEY (uploader_id)
                                            REFERENCES sys_user(id),

                                    CONSTRAINT fk_knowledge_category
                                        FOREIGN KEY (category_id)
                                            REFERENCES ticket_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文档表';

-- 21. 知识库文本块
CREATE TABLE IF NOT EXISTS knowledge_chunk (
                                 id BIGINT NOT NULL AUTO_INCREMENT COMMENT '知识块ID',
                                 document_id BIGINT NOT NULL COMMENT '文档ID',

                                 content TEXT NOT NULL COMMENT '文本内容',
                                 chunk_index INT NOT NULL COMMENT '文本块序号',

                                 metadata JSON DEFAULT NULL COMMENT '元数据',

                                 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                                 PRIMARY KEY (id),
                                 UNIQUE KEY uk_document_chunk (document_id, chunk_index),
                                 KEY idx_document_id (document_id),

                                 CONSTRAINT fk_chunk_document
                                     FOREIGN KEY (document_id)
                                         REFERENCES knowledge_document(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文本块表';

-- 22. AI任务记录
CREATE TABLE IF NOT EXISTS ai_task (
                         id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'AI任务ID',

                         task_type VARCHAR(50) NOT NULL COMMENT 'AI任务类型',
                         business_type VARCHAR(50) NOT NULL COMMENT '业务类型',
                         business_id BIGINT NOT NULL COMMENT '业务ID',

                         status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                             COMMENT '状态：PENDING/RUNNING/SUCCESS/FAILED',

                         input TEXT COMMENT 'AI输入',
                         output TEXT COMMENT 'AI输出',
                         error_message TEXT COMMENT '错误信息',

                         started_at DATETIME DEFAULT NULL COMMENT '开始时间',
                         completed_at DATETIME DEFAULT NULL COMMENT '完成时间',

                         created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

                         PRIMARY KEY (id),

                         KEY idx_business (business_type, business_id),
                         KEY idx_task_type (task_type),
                         KEY idx_status (status),
                         KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI任务记录表';

-- ============================================================================
-- 二、种子数据
-- ============================================================================

-- 1. 部门
INSERT IGNORE INTO sys_department
(id, name, parent_id, manager_id, status)
VALUES
    (1, '总经办', NULL, NULL, 1),
    (2, '销售部', NULL, NULL, 1),
    (3, '技术支持部', NULL, NULL, 1),
    (4, '信息技术部', 3, NULL, 1),
    (5, '信息安全部', 3, NULL, 1);

-- 2. 用户（BCrypt密码均为：123456）
INSERT IGNORE INTO sys_user
(id, username, password, employee_no, real_name, department_id, position, phone, email, status)
VALUES
    (1, 'zhangwei',
     '$2a$10$mfy7TWz1LIJ5/6vUVluJp.SOcWbCwPUWliMF7G3YeoHJSiy5CM1tK',
     'EMP001', '张伟', 2, '销售经理', '13800000001', 'zhangwei@example.com', 1),
    (2, 'lina',
     '$2a$10$mfy7TWz1LIJ5/6vUVluJp.SOcWbCwPUWliMF7G3YeoHJSiy5CM1tK',
     'EMP002', '李娜', 4, 'IT运维工程师', '13800000002', 'lina@example.com', 1),
    (3, 'wanggong',
     '$2a$10$mfy7TWz1LIJ5/6vUVluJp.SOcWbCwPUWliMF7G3YeoHJSiy5CM1tK',
     'EMP003', '王工', 5, '信息安全工程师', '13800000003', 'wanggong@example.com', 1),
    (4, 'wangmanager',
     '$2a$10$mfy7TWz1LIJ5/6vUVluJp.SOcWbCwPUWliMF7G3YeoHJSiy5CM1tK',
     'EMP004', '王经理', 4, 'IT服务经理', '13800000004', 'wangmanager@example.com', 1),
    (5, 'admin',
     '$2a$10$mfy7TWz1LIJ5/6vUVluJp.SOcWbCwPUWliMF7G3YeoHJSiy5CM1tK',
     'EMP005', '系统管理员', 4, '系统管理员', '13800000005', 'admin@example.com', 1);

-- 3. 更新部门负责人
UPDATE sys_department SET manager_id = 1 WHERE id = 2;
UPDATE sys_department SET manager_id = 4 WHERE id = 4;
UPDATE sys_department SET manager_id = 3 WHERE id = 5;

-- 4. IT服务团队
INSERT IGNORE INTO sys_team
(id, name, department_id, manager_id, status)
VALUES
    (1, '账号权限组', 4, 4, 1),
    (2, '网络运维组', 4, 4, 1),
    (3, '桌面支持组', 4, 4, 1),
    (4, '信息安全组', 5, 3, 1);

-- 5. 团队成员
INSERT IGNORE INTO sys_team_member
(id, team_id, user_id, team_role)
VALUES
    (1, 1, 2, 'MEMBER'),
    (2, 1, 4, 'LEADER'),
    (3, 2, 4, 'LEADER'),
    (4, 3, 4, 'LEADER'),
    (5, 4, 3, 'LEADER');

-- 6. 角色
INSERT IGNORE INTO sys_role
(id, role_code, role_name, description)
VALUES
    (1, 'USER', '普通用户', '可以创建和查看自己的工单'),
    (2, 'ENGINEER', '工程师', '负责处理和协作处理工单'),
    (3, 'TEAM_MANAGER', '团队负责人', '负责团队工单管理和人员调度'),
    (4, 'ADMIN', '系统管理员', '负责系统配置和权限管理');

-- 7. 权限
INSERT IGNORE INTO sys_permission
(id, permission_code, permission_name, description)
VALUES
    -- 用户基础权限
    (1, 'ticket:create', '创建工单', '创建IT服务工单'),
    (2, 'ticket:view:self', '查看自己的工单', '查看本人创建的工单'),
    (3, 'ticket:comment', '工单评论', '在工单中发表评论'),
    (4, 'ticket:attachment', '上传附件', '上传工单附件'),
    (5, 'ticket:nudge', '催办工单', '对处理中的工单进行催办'),
    (6, 'ticket:confirm', '确认解决', '确认工单问题已经解决'),
    (7, 'ticket:rate', '工单评价', '对已解决工单进行评价'),
    -- 工程师权限
    (8, 'ticket:view:assigned', '查看负责工单', '查看分配给自己的工单'),
    (9, 'ticket:accept', '接受工单', '接受系统分配的工单'),
    (10, 'ticket:process', '处理工单', '处理和更新工单'),
    (11, 'ticket:transfer', '转派工单', '将工单转交给其他工程师'),
    (12, 'ticket:collaborate', '发起协作', '邀请其他工程师协助处理'),
    (13, 'ticket:resolve', '解决工单', '提交工单解决方案'),
    -- 团队负责人权限
    (14, 'ticket:view:team', '查看团队工单', '查看团队负责的全部工单'),
    (15, 'ticket:assign', '分配工单', '向工程师分配工单'),
    (16, 'ticket:reassign', '重新分配工单', '调整工单负责人'),
    (17, 'ticket:escalate', '升级工单', '对超时或复杂工单进行升级'),
    (18, 'sla:view', '查看SLA', '查看团队SLA情况'),
    (19, 'report:view', '查看统计报表', '查看团队业务统计'),
    -- 管理员权限
    (20, 'user:manage', '用户管理', '管理系统用户'),
    (21, 'role:manage', '角色管理', '管理系统角色'),
    (22, 'permission:manage', '权限管理', '管理系统权限'),
    (23, 'department:manage', '部门管理', '管理组织部门'),
    (24, 'team:manage', '团队管理', '管理IT服务团队'),
    (25, 'category:manage', '分类管理', '管理工单分类'),
    (26, 'sla:manage', 'SLA管理', '管理SLA规则'),
    (27, 'system:manage', '系统配置', '管理系统基础配置'),
    (28, 'ticket:transfer:approve', '审批转派', '审批跨团队工单转派申请');

-- 8. 用户角色
INSERT IGNORE INTO sys_user_role
(id, user_id, role_id)
VALUES
    (1, 1, 1),
    (2, 2, 1),
    (3, 2, 2),
    (4, 3, 1),
    (5, 3, 2),
    (6, 4, 1),
    (7, 4, 2),
    (8, 4, 3),
    (9, 5, 1),
    (10, 5, 4);

-- 9. 角色权限
-- USER（普通用户）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- ENGINEER（工程师）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
VALUES
    (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13);

-- TEAM_MANAGER（团队负责人，含跨团队转派审批）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
VALUES
    (3, 14), (3, 15), (3, 16), (3, 17), (3, 18), (3, 19), (3, 28);

-- ADMIN（系统管理员）
INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
VALUES
    (4, 20), (4, 21), (4, 22), (4, 23), (4, 24), (4, 25), (4, 26), (4, 27);

-- 10. 工单分类
-- 一级分类
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (1, '系统故障', NULL, '企业信息系统相关问题', 1),
    (2, '网络问题', NULL, '网络连接及访问相关问题', 1),
    (3, '软件问题', NULL, '软件安装、运行及使用问题', 1),
    (4, '硬件问题', NULL, '电脑及办公设备相关问题', 1),
    (5, '安全问题', NULL, '信息安全相关问题', 1);

-- 二级分类：系统故障
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (6, '账号问题', 1, '用户账号相关问题', 1),
    (7, '密码问题', 1, '密码修改和重置问题', 1),
    (8, '权限问题', 1, '系统访问权限问题', 1);

-- 二级分类：网络
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (9, '无法联网', 2, '无法连接公司网络', 1),
    (10, 'VPN问题', 2, 'VPN连接及访问问题', 1),
    (11, '网络速度慢', 2, '网络访问速度异常', 1);

-- 二级分类：软件
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (12, '软件安装', 3, '软件安装相关问题', 1),
    (13, '软件崩溃', 3, '软件运行异常或崩溃', 1),
    (14, '软件配置', 3, '软件配置相关问题', 1);

-- 二级分类：硬件
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (15, '电脑故障', 4, '电脑硬件故障', 1),
    (16, '显示器故障', 4, '显示器相关问题', 1),
    (17, '打印机故障', 4, '打印机相关问题', 1);

-- 二级分类：安全
INSERT IGNORE INTO ticket_category
(id, name, parent_id, description, status)
VALUES
    (18, '异常登录', 5, '账号异常登录问题', 1),
    (19, '病毒木马', 5, '病毒及恶意程序问题', 1),
    (20, '安全事件', 5, '信息安全事件', 1);

-- 11. SLA规则
INSERT IGNORE INTO sla_rule
(id, name, priority, response_minutes, resolve_minutes, escalation_minutes, status)
VALUES
    (1, '紧急工单SLA', 'URGENT', 5, 30, 20, 1),
    (2, '高优先级工单SLA', 'HIGH', 15, 120, 90, 1),
    (3, '普通工单SLA', 'MEDIUM', 30, 480, 360, 1),
    (4, '低优先级工单SLA', 'LOW', 120, 1440, 1200, 1);

SET FOREIGN_KEY_CHECKS = 1;
