package com.proconnect.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proconnect.backend.dto.CreateReportRequest;
import com.proconnect.backend.dto.UpdateReportStatusRequest;
import com.proconnect.backend.model.Report;
import com.proconnect.backend.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public Map<String, Object> createReport(@RequestBody CreateReportRequest request) {
        Report savedReport = reportService.createReport(request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Report submitted successfully");
        response.put("report", savedReport);

        return response;
    }

    @GetMapping
    public List<Report> getReports(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return reportService.getReportsByStatus(status);
        }

        return reportService.getAllReports();
    }

    @GetMapping("/user/{userId}")
    public List<Report> getReportsForUser(@PathVariable String userId) {
        return reportService.getReportsForUser(userId);
    }

    @PatchMapping("/{reportId}")
    public Report updateReportStatus(
            @PathVariable String reportId,
            @RequestBody UpdateReportStatusRequest request
    ) {
        return reportService.updateReportStatus(reportId, request);
    }
}
