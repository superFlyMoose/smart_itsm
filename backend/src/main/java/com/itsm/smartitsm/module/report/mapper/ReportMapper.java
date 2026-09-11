package com.itsm.smartitsm.module.report.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 报表统计 Mapper
 */
@Mapper
public interface ReportMapper {

    /**
     * 按工单状态统计数量
     */
    @Select("SELECT status AS status, COUNT(*) AS cnt FROM ticket GROUP BY status")
    List<Map<String, Object>> countByStatus();

    /**
     * 按创建日期统计工单数量
     */
    @Select("SELECT DATE(created_at) AS stat_date, COUNT(*) AS cnt FROM ticket "
            + "WHERE created_at BETWEEN #{startTime} AND #{endTime} "
            + "GROUP BY DATE(created_at)")
    List<Map<String, Object>> countCreatedByDate(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * 按关闭日期统计工单数量
     */
    @Select("SELECT DATE(closed_at) AS stat_date, COUNT(*) AS cnt FROM ticket "
            + "WHERE closed_at BETWEEN #{startTime} AND #{endTime} "
            + "GROUP BY DATE(closed_at)")
    List<Map<String, Object>> countClosedByDate(@Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);

    /**
     * 按分类统计工单数量
     */
    @Select("SELECT t.category_id AS category_id, c.name AS category_name, COUNT(*) AS cnt "
            + "FROM ticket t LEFT JOIN ticket_category c ON t.category_id = c.id "
            + "WHERE t.category_id IS NOT NULL "
            + "GROUP BY t.category_id, c.name")
    List<Map<String, Object>> countByCategory();

    /**
     * 按工程师统计工作量
     */
    @Select("SELECT assignee_id AS engineer_id, COUNT(*) AS assigned_count, "
            + "SUM(CASE WHEN status IN ('PROCESSING','WAITING_COLLABORATION','WAITING_CONFIRM') "
            + "THEN 1 ELSE 0 END) AS processing_count, "
            + "SUM(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE 0 END) AS resolved_count, "
            + "SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) AS closed_count "
            + "FROM ticket WHERE assignee_id IS NOT NULL GROUP BY assignee_id")
    List<Map<String, Object>> engineerWorkload();

    /**
     * SLA 达标情况汇总。超时按截止时间动态判定：
     * 实际时间晚于截止时间，或截止时间已过且尚未响应/解决，均计为超时
     */
    @Select("SELECT COUNT(*) AS total, "
            + "SUM(CASE WHEN first_response_at IS NOT NULL AND first_response_at > response_deadline "
            + "THEN 1 WHEN first_response_at IS NULL AND response_deadline < NOW() "
            + "THEN 1 ELSE 0 END) AS response_breached, "
            + "SUM(CASE WHEN resolved_at IS NOT NULL AND resolved_at > resolve_deadline "
            + "THEN 1 WHEN resolved_at IS NULL AND resolve_deadline < NOW() "
            + "THEN 1 ELSE 0 END) AS resolve_breached "
            + "FROM ticket_sla")
    Map<String, Object> slaSummary();
}
