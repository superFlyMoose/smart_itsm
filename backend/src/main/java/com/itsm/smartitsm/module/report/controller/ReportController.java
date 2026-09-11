package com.itsm.smartitsm.module.report.controller;

import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.report.service.ReportService;
import com.itsm.smartitsm.module.report.vo.CategoryStatVO;
import com.itsm.smartitsm.module.report.vo.EngineerWorkloadVO;
import com.itsm.smartitsm.module.report.vo.SlaReportVO;
import com.itsm.smartitsm.module.report.vo.TicketOverviewVO;
import com.itsm.smartitsm.module.report.vo.TicketTrendVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 统计报表接口
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('report:view')")
public class ReportController {

    private final ReportService reportService;

    /**
     * 工单总体统计
     */
    @GetMapping("/tickets/overview")
    public Result<TicketOverviewVO> overview() {
        return Result.success(reportService.overview());
    }

    /**
     * 工单创建/关闭趋势
     */
    @GetMapping("/tickets/trend")
    public Result<List<TicketTrendVO>> trend(@RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        return Result.success(reportService.trend(startDate, endDate));
    }

    /**
     * 工单分类统计
     */
    @GetMapping("/tickets/category")
    public Result<List<CategoryStatVO>> categoryStat() {
        return Result.success(reportService.categoryStat());
    }

    /**
     * 工程师工作量统计
     */
    @GetMapping("/engineers/workload")
    public Result<List<EngineerWorkloadVO>> engineerWorkload() {
        return Result.success(reportService.engineerWorkload());
    }

    /**
     * SLA 达标率统计
     */
    @GetMapping("/sla")
    public Result<SlaReportVO> slaReport() {
        return Result.success(reportService.slaReport());
    }
}
