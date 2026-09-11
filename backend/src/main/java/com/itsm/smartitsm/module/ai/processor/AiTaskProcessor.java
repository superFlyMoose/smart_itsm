package com.itsm.smartitsm.module.ai.processor;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.smartitsm.common.enums.AiTaskStatusEnum;
import com.itsm.smartitsm.common.enums.AiTaskTypeEnum;
import com.itsm.smartitsm.module.ai.entity.AiTask;
import com.itsm.smartitsm.module.ai.mapper.AiTaskMapper;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import com.itsm.smartitsm.module.category.mapper.TicketCategoryMapper;
import com.itsm.smartitsm.module.knowledge.entity.KnowledgeDocument;
import com.itsm.smartitsm.module.knowledge.mapper.KnowledgeDocumentMapper;
import com.itsm.smartitsm.module.ticket.entity.Ticket;
import com.itsm.smartitsm.module.ticket.mapper.TicketMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * AI 任务处理器
 *
 * <p>任务状态流转：PENDING -> RUNNING -> SUCCESS/FAILED。
 * 入口方法带 @Async，既可由 RabbitMQ 消费者调用，也可在 MQ 不可用时作为进程内降级执行。
 * 通过 {@code WHERE status='PENDING'} 的条件更新实现幂等，消息重复投递不会重复执行。</p>
 *
 * <p>当前未接入外部大模型，采用基于关键词与中文二元组的本地启发式算法，
 * AI 只把结果写入 ai_task.output，不直接修改工单状态（符合接口设计文档 63 节约束）。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiTaskProcessor {

    private static final int ERROR_MAX_LENGTH = 500;
    private static final int SUGGESTION_LIMIT = 3;
    private static final int RETRIEVAL_LIMIT = 5;

    private final AiTaskMapper aiTaskMapper;
    private final TicketMapper ticketMapper;
    private final TicketCategoryMapper ticketCategoryMapper;
    private final KnowledgeDocumentMapper knowledgeDocumentMapper;
    private final ObjectMapper objectMapper;

    @Async("aiTaskExecutor")
    public void process(Long taskId) {
        AiTask task = aiTaskMapper.selectById(taskId);
        if (task == null) {
            log.warn("AI任务不存在，taskId={}", taskId);
            return;
        }

        // CAS：仅 PENDING 任务可进入 RUNNING，保证消费重试时不重复执行
        int rows = aiTaskMapper.update(null, new LambdaUpdateWrapper<AiTask>()
                .eq(AiTask::getId, taskId)
                .eq(AiTask::getStatus, AiTaskStatusEnum.PENDING.name())
                .set(AiTask::getStatus, AiTaskStatusEnum.RUNNING.name())
                .set(AiTask::getStartedAt, LocalDateTime.now()));
        if (rows == 0) {
            log.info("AI任务非PENDING状态，跳过执行，taskId={}, status={}", taskId, task.getStatus());
            return;
        }

        try {
            AiTaskTypeEnum taskType = AiTaskTypeEnum.valueOf(task.getTaskType());
            Object result = switch (taskType) {
                case TICKET_CLASSIFICATION -> classifyTicket(task);
                case TICKET_SOLUTION_SUGGESTION -> suggestSolutions(task);
                case KNOWLEDGE_RETRIEVAL -> retrieveKnowledge(task);
                case TICKET_SUMMARY -> summarizeTicket(task);
            };
            markSuccess(taskId, result);
            log.info("AI任务执行成功，taskId={}, type={}", taskId, task.getTaskType());
        } catch (Exception e) {
            log.error("AI任务执行失败，taskId={}, type={}", taskId, task.getTaskType(), e);
            markFailed(taskId, e.getMessage());
        }
    }

    // ========================= 任务类型处理 =========================

    /**
     * 工单智能分类：按分类名称与工单文本的关键词匹配度推荐分类
     */
    private Map<String, Object> classifyTicket(AiTask task) {
        Ticket ticket = getTicketOrThrow(task);
        Set<String> ticketTokens = tokens(ticket.getTitle() + " " + safe(ticket.getDescription()));

        List<TicketCategory> categories = ticketCategoryMapper.selectList(
                new LambdaQueryWrapper<TicketCategory>()
                        .eq(TicketCategory::getStatus, 1)
                        .orderByAsc(TicketCategory::getId));

        String ticketText = ticket.getTitle() + safe(ticket.getDescription());
        TicketCategory best = null;
        int bestScore = 0;
        List<String> bestMatched = List.of();

        for (TicketCategory category : categories) {
            Set<String> categoryTokens = tokens(category.getName() + " " + safe(category.getDescription()));
            List<String> matched = ticketTokens.stream()
                    .filter(categoryTokens::contains)
                    .distinct()
                    .limit(10)
                    .toList();
            int score = matched.size();
            // 分类全名直接出现在工单文本中，给予显著加权
            if (category.getName() != null && category.getName().length() >= 2
                    && ticketText.contains(category.getName())) {
                score += 3;
            }
            if (score > bestScore) {
                bestScore = score;
                best = category;
                bestMatched = matched;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        if (best == null) {
            result.put("suggestedCategoryId", null);
            result.put("suggestedCategoryName", null);
            result.put("confidence", 0.0);
            result.put("matchedKeywords", List.of());
            result.put("reason", "未匹配到合适的分类，建议人工选择");
        } else {
            double confidence = Math.min(0.95, Math.round(bestScore * 100.0 / (bestScore + 3)) / 100.0);
            result.put("suggestedCategoryId", best.getId());
            result.put("suggestedCategoryName", best.getName());
            result.put("confidence", confidence);
            result.put("matchedKeywords", bestMatched);
            result.put("reason", "根据工单标题与描述中的关键词匹配推荐分类：" + best.getName());
        }
        return result;
    }

    /**
     * 解决方案推荐：从已发布知识库中按文本相似度返回最相关的 3 篇文档
     */
    private Map<String, Object> suggestSolutions(AiTask task) {
        Ticket ticket = getTicketOrThrow(task);
        List<Map<String, Object>> documents = rankKnowledgeDocuments(
                ticket.getTitle() + " " + safe(ticket.getDescription()), SUGGESTION_LIMIT);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketId", ticket.getId());
        result.put("suggestions", documents);
        result.put("reason", documents.isEmpty()
                ? "知识库中暂无匹配的解决方案文档"
                : "已根据工单内容从知识库匹配到 " + documents.size() + " 篇可能相关的文档");
        return result;
    }

    /**
     * 知识检索：按查询文本检索最相关的 5 篇已发布文档
     */
    private Map<String, Object> retrieveKnowledge(AiTask task) {
        String query = task.getInput();
        if (!hasText(query)) {
            Ticket ticket = getTicketOrThrow(task);
            query = ticket.getTitle() + " " + safe(ticket.getDescription());
        }
        List<Map<String, Object>> documents = rankKnowledgeDocuments(query, RETRIEVAL_LIMIT);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("query", query);
        result.put("documents", documents);
        return result;
    }

    /**
     * 工单摘要：抽取工单关键信息生成结构化摘要
     */
    private Map<String, Object> summarizeTicket(AiTask task) {
        Ticket ticket = getTicketOrThrow(task);
        int descriptionLength = safe(ticket.getDescription()).length();
        String assigneeText = ticket.getAssigneeId() == null
                ? "尚未分配处理人"
                : "处理人ID：" + ticket.getAssigneeId();

        String summary = String.format("工单%s《%s》：优先级%s，当前状态%s，%s，问题描述共%d字。",
                ticket.getTicketNo(), ticket.getTitle(),
                priorityName(ticket.getPriority()), statusName(ticket.getStatus()),
                assigneeText, descriptionLength);

        List<String> keyInfo = new ArrayList<>();
        keyInfo.add("优先级：" + priorityName(ticket.getPriority()));
        keyInfo.add("状态：" + statusName(ticket.getStatus()));
        keyInfo.add(assigneeText);
        if (ticket.getTeamId() != null) {
            keyInfo.add("负责团队ID：" + ticket.getTeamId());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketId", ticket.getId());
        result.put("ticketNo", ticket.getTicketNo());
        result.put("title", ticket.getTitle());
        result.put("summary", summary);
        result.put("keyInfo", keyInfo);
        return result;
    }

    // ========================= 内部辅助方法 =========================

    private Ticket getTicketOrThrow(AiTask task) {
        Ticket ticket = ticketMapper.selectById(task.getBusinessId());
        if (ticket == null) {
            throw new IllegalStateException("关联工单不存在，businessId=" + task.getBusinessId());
        }
        return ticket;
    }

    /**
     * 按文本与知识文档标题的重合词元数排序，取前 limit 条
     */
    private List<Map<String, Object>> rankKnowledgeDocuments(String queryText, int limit) {
        Set<String> queryTokens = tokens(queryText);
        if (queryTokens.isEmpty()) {
            return List.of();
        }
        List<KnowledgeDocument> documents = knowledgeDocumentMapper.selectList(
                new LambdaQueryWrapper<KnowledgeDocument>()
                        .eq(KnowledgeDocument::getStatus, "PUBLISHED"));

        record Scored(KnowledgeDocument document, int score) {
        }

        return documents.stream()
                .map(doc -> {
                    Set<String> docTokens = tokens(doc.getTitle());
                    int score = (int) queryTokens.stream().filter(docTokens::contains).count();
                    return new Scored(doc, score);
                })
                .filter(scored -> scored.score() > 0)
                .sorted(Comparator.comparingInt(Scored::score).reversed())
                .limit(limit)
                .map(scored -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("documentId", scored.document().getId());
                    item.put("title", scored.document().getTitle());
                    item.put("fileUrl", scored.document().getFileUrl());
                    item.put("score", scored.score());
                    return item;
                })
                .toList();
    }

    private void markSuccess(Long taskId, Object result) {
        try {
            aiTaskMapper.update(null, new LambdaUpdateWrapper<AiTask>()
                    .eq(AiTask::getId, taskId)
                    .set(AiTask::getStatus, AiTaskStatusEnum.SUCCESS.name())
                    .set(AiTask::getOutput, objectMapper.writeValueAsString(result))
                    .set(AiTask::getCompletedAt, LocalDateTime.now()));
        } catch (Exception e) {
            log.error("写入AI任务成功结果失败，taskId={}", taskId, e);
            markFailed(taskId, "结果序列化失败：" + e.getMessage());
        }
    }

    private void markFailed(Long taskId, String errorMessage) {
        String message = errorMessage == null ? "未知错误" : errorMessage;
        if (message.length() > ERROR_MAX_LENGTH) {
            message = message.substring(0, ERROR_MAX_LENGTH);
        }
        aiTaskMapper.update(null, new LambdaUpdateWrapper<AiTask>()
                .eq(AiTask::getId, taskId)
                .set(AiTask::getStatus, AiTaskStatusEnum.FAILED.name())
                .set(AiTask::getErrorMessage, message)
                .set(AiTask::getCompletedAt, LocalDateTime.now()));
    }

    /**
     * 提取词元：连续字母数字（长度>=2）+ 中文相邻二元组，兼顾中英文匹配
     */
    private Set<String> tokens(String text) {
        Set<String> tokens = new java.util.HashSet<>();
        if (!hasText(text)) {
            return tokens;
        }
        String lower = text.toLowerCase();
        StringBuilder latin = new StringBuilder();
        char[] chars = lower.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];
            if (Character.isLetterOrDigit(c) && c < 128) {
                latin.append(c);
            } else {
                flushLatin(latin, tokens);
            }
            // 中文二元组
            if (isChinese(c) && i + 1 < chars.length && isChinese(chars[i + 1])) {
                tokens.add(new String(new char[]{c, chars[i + 1]}));
            }
        }
        flushLatin(latin, tokens);
        return tokens;
    }

    private void flushLatin(StringBuilder latin, Set<String> tokens) {
        if (latin.length() >= 2) {
            tokens.add(latin.toString());
        }
        latin.setLength(0);
    }

    private boolean isChinese(char c) {
        return c >= '\u4e00' && c <= '\u9fff';
    }

    private boolean hasText(String text) {
        return text != null && !text.isBlank();
    }

    private String safe(String text) {
        return text == null ? "" : text;
    }

    private String priorityName(String priority) {
        if (priority == null) {
            return "未知";
        }
        return switch (priority) {
            case "URGENT" -> "紧急";
            case "HIGH" -> "高";
            case "MEDIUM" -> "中";
            case "LOW" -> "低";
            default -> priority;
        };
    }

    private String statusName(String status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case "OPEN" -> "待分配";
            case "ASSIGNED" -> "已分配";
            case "PROCESSING" -> "处理中";
            case "WAITING_COLLABORATION" -> "协作中";
            case "WAITING_CONFIRM" -> "待确认";
            case "CLOSED" -> "已关闭";
            case "CANCELLED" -> "已取消";
            default -> status;
        };
    }
}
