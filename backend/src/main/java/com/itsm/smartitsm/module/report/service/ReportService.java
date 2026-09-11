package com.itsm.smartitsm.module.report.service;

import com.itsm.smartitsm.module.report.vo.CategoryStatVO;
import com.itsm.smartitsm.module.report.vo.EngineerWorkloadVO;
import com.itsm.smartitsm.module.report.vo.SlaReportVO;
import com.itsm.smartitsm.module.report.vo.TicketOverviewVO;
import com.itsm.smartitsm.module.report.vo.TicketTrendVO;

import java.util.List;

/**
 * 统计报表服务
 */
public interface ReportService {

    /**
     * 工单总体统计
     */
    TicketOverviewVO overview();

    /**
     * 工单创建/关闭趋势
     *
     * @param startDate 开始日期 yyyy-MM-dd
     * @param endDate   结束日期 yyyy-MM-dd
     */
    List<TicketTrendVO> trend(String startDate, String endDate);

    /**
     * 工单分类统计
     */
    List<CategoryStatVO> categoryStat();

    /**
     * 工程师工作量统计
     */
    List<EngineerWorkloadVO> engineerWorkload();

    /**
     * SLA 达标率统计
     */
    SlaReportVO slaReport();
}
