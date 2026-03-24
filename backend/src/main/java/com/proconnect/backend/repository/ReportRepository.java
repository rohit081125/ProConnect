package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Report;

public interface ReportRepository extends MongoRepository<Report, String> {

    boolean existsByApplicationIdAndReporterId(String applicationId, String reporterId);

    List<Report> findByReportedUserId(String reportedUserId);

    List<Report> findByReporterId(String reporterId);
}