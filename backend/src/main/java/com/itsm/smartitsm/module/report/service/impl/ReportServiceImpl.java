package com.itsm.smartitsm.module.report.service.impl;

import com.itsm.smartitsm.common.util.TimeUtil;
import com.itsm.smartitsm.module.report.mapper.ReportMapper;
import com.itsm.smartitsm.module.report.service.ReportService;
import com.itsm.smartitsm.module.report.vo.CategoryStatVO;
import com.itsm.smartitsm.module.report.vo.EngineerWorkloadVO;
import com.itsm.smartitsm.module.report.vo.SlaReportVO;
import com.itsm.smartitsm.module.report.vo.TicketOverviewVO;
import com.itsm.smartitsm.module.report.vo.TicketTrendVO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计报表服务实现
 */
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ReportMapper reportMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public TicketOverviewVO overview() {
        Map<String, Long> countByStatus = new HashMap<>();
        long total = 0;
        for (Map<String, Object> row : reportMapper.countByStatus()) {
            long cnt = toLong(row.get("cnt"));
            total += cnt;
            countByStatus.put(String.valueOf(row.get("status")), cnt);
        }
        TicketOverviewVO vo = new TicketOverviewVO();
        vo.setTotal(total);
        vo.setOpen(countByStatus.getOrDefault("OPEN", 0L));
        vo.setAssigned(countByStatus.getOrDefault("ASSIGNED", 0L));
        vo.setProcessing(countByStatus.getOrDefault("PROCESSING", 0L));
        vo.setWaitingCollaboration(countByStatus.getOrDefault("WAITING_COLLABORATION", 0L));
        vo.setWaitingConfirm(countByStatus.getOrDefault("WAITING_CONFIRM", 0L));
        vo.setClosed(countByStatus.getOrDefault("CLOSED", 0L));
        vo.setCancelled(countByStatus.getOrDefault("CANCELLED", 0L));
        return vo;
    }

    @Override
    public List<TicketTrendVO> trend(String startDate, String endDate) {
        LocalDate start = TimeUtil.parse(startDate, false) != null
                ? TimeUtil.parse(startDate, false).toLocalDate() : LocalDate.now().minusDays(6);
        LocalDate end = TimeUtil.parse(endDate, true) != null
                ? TimeUtil.parse(endDate, true).toLocalDate() : LocalDate.now();
        if (end.isBefore(start)) {
            LocalDate tmp = start;
            start = end;
            end = tmp;
        }

        Map<String, Long> createdMap = loadDateCounts(
                reportMapper.countCreatedByDate(start.atStartOfDay(), end.atTime(23, 59, 59)));
        Map<String, Long> closedMap = loadDateCounts(
                reportMapper.countClosedByDate(start.atStartOfDay(), end.atTime(23, 59, 59)));

        List<TicketTrendVO> result = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            String dateText = date.format(DATE_FORMATTER);
            result.add(new TicketTrendVO(dateText,
                    createdMap.getOrDefault(dateText, 0L),
                    closedMap.getOrDefault(dateText, 0L)));
        }
        return result;
    }

    @Override
    public List<CategoryStatVO> categoryStat() {
        List<CategoryStatVO> result = new ArrayList<>();
        for (Map<String, Object> row : reportMapper.countByCategory()) {
            CategoryStatVO vo = new CategoryStatVO();
            vo.setCategoryId(toLong(row.get("category_id")));
            vo.setCategoryName(row.get("category_name") == null ? null
                    : String.valueOf(row.get("category_name")));
            vo.setCount(toLong(row.get("cnt")));
            result.add(vo);
        }
        return result;
    }

    @Override
    public List<EngineerWorkloadVO> engineerWorkload() {
        List<Map<String, Object>> rows = reportMapper.engineerWorkload();
        List<Long> engineerIds = rows.stream()
                .map(row -> toLong(row.get("engineer_id")))
                .toList();
        Map<Long, String> engineerNames = new HashMap<>();
        if (!engineerIds.isEmpty()) {
            for (SysUser user : sysUserMapper.selectBatchIds(engineerIds)) {
                engineerNames.put(user.getId(), user.getRealName());
            }
        }
        List<EngineerWorkloadVO> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Long engineerId = toLong(row.get("engineer_id"));
            EngineerWorkloadVO vo = new EngineerWorkloadVO();
            vo.setEngineerId(engineerId);
            vo.setEngineerName(engineerNames.get(engineerId));
            vo.setAssignedCount(toLong(row.get("assigned_count")));
            vo.setProcessingCount(toLong(row.get("processing_count")));
            vo.setResolvedCount(toLong(row.get("resolved_count")));
            vo.setClosedCount(toLong(row.get("closed_count")));
            result.add(vo);
        }
        return result;
    }

    @Override
    public SlaReportVO slaReport() {
        Map<String, Object> row = reportMapper.slaSummary();
        long total = row == null ? 0L : toLong(row.get("total"));
        long responseBreached = row == null ? 0L : toLong(row.get("response_breached"));
        long resolveBreached = row == null ? 0L : toLong(row.get("resolve_breached"));

        SlaReportVO vo = new SlaReportVO();
        vo.setTotalTickets(total);
        vo.setResponseBreached(responseBreached);
        vo.setResolveBreached(resolveBreached);
        vo.setResponseComplianceRate(complianceRate(total, responseBreached));
        vo.setResolveComplianceRate(complianceRate(total, resolveBreached));
        return vo;
    }

    /**
     * 达标率 = (总数 - 超时数) / 总数 * 100，保留 1 位小数
     */
    private Double complianceRate(long total, long breached) {
        if (total <= 0) {
            return 100.0;
        }
        return BigDecimal.valueOf((total - breached) * 100.0 / total)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private Map<String, Long> loadDateCounts(List<Map<String, Object>> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Object statDate = row.get("stat_date");
            if (statDate != null) {
                map.put(String.valueOf(statDate), toLong(row.get("cnt")));
            }
        }
        return map;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
}
