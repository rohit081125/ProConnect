package com.proconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.CreateReportRequest;
import com.proconnect.backend.model.Application;
import com.proconnect.backend.model.Report;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.ReportRepository;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Report createReport(CreateReportRequest request) {
        if (request.getApplicationId() == null || request.getApplicationId().trim().isEmpty()) {
            throw new RuntimeException("Application ID is required");
        }

        if (request.getReporterId() == null || request.getReporterId().trim().isEmpty()) {
            throw new RuntimeException("Reporter ID is required");
        }

        if (request.getReportedUserId() == null || request.getReportedUserId().trim().isEmpty()) {
            throw new RuntimeException("Reported user ID is required");
        }

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (reportRepository.existsByApplicationIdAndReporterId(request.getApplicationId(), request.getReporterId())) {
            throw new RuntimeException("You have already reported this application");
        }

        Report report = new Report();
        report.setApplicationId(request.getApplicationId());
        report.setWorkId(request.getWorkId() != null ? request.getWorkId() : application.getWorkId());
        report.setReporterId(request.getReporterId());
        report.setReportedUserId(request.getReportedUserId());
        report.setReporterRole(request.getReporterRole());
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());

        return reportRepository.save(report);
    }
}