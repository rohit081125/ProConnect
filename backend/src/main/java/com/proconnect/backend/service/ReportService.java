package com.proconnect.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.CreateReportRequest;
import com.proconnect.backend.dto.UpdateReportStatusRequest;
import com.proconnect.backend.model.Application;
import com.proconnect.backend.model.Report;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.ReportRepository;
import com.proconnect.backend.repository.UserRepository;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Report createReport(CreateReportRequest request) {
        if (request.getReporterId() == null || request.getReporterId().trim().isEmpty()) {
            throw new RuntimeException("Reporter ID is required");
        }

        if (request.getReportedUserId() == null || request.getReportedUserId().trim().isEmpty()) {
            throw new RuntimeException("Reported user ID is required");
        }

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }

        Application application = null;
        if (request.getApplicationId() != null && !request.getApplicationId().trim().isEmpty()) {
            application = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new RuntimeException("Application not found"));
        }
        userService.requireActiveUser(request.getReporterId());

        if (application != null && reportRepository.existsByApplicationIdAndReporterId(request.getApplicationId(), request.getReporterId())) {
            throw new RuntimeException("You have already reported this application");
        }

        Report report = new Report();
        report.setApplicationId(request.getApplicationId());
        report.setWorkId(request.getWorkId() != null ? request.getWorkId() : application != null ? application.getWorkId() : null);
        report.setReporterId(request.getReporterId());
        report.setReportedUserId(request.getReportedUserId());
        report.setReporterRole(request.getReporterRole());
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());

        Report savedReport = reportRepository.save(report);

        // Notify Admin
        User admin = userRepository.findByEmail("rohitdongre1108@gmail.com").orElse(null);
        if (admin != null) {
            String reporterName = "User";
            try {
                User reporter = userRepository.findById(report.getReporterId()).orElse(null);
                if (reporter != null) {
                    reporterName = reporter.getName();
                }
            } catch (Exception e) {
                // Ignore fallback
            }

            notificationService.createNotification(
                    admin.getId(),
                    report.getReporterId(),
                    report.getWorkId(),
                    report.getApplicationId(),
                    "USER_REPORTED",
                    "⚠️ [REPORT] " + reporterName + " filed a report: \"" + report.getReason() + "\""
            );
        }

        return savedReport;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Report> getReportsForUser(String userId) {
        return reportRepository.findByReportedUserId(userId);
    }

    public Report updateReportStatus(String reportId, UpdateReportStatusRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            report.setStatus(request.getStatus());
        }

        if (request.getAdminNote() != null) {
            report.setAdminNote(request.getAdminNote());
        }

        return reportRepository.save(report);
    }
}
