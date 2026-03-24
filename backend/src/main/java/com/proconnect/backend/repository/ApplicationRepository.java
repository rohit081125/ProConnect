package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Application;

public interface ApplicationRepository extends MongoRepository<Application, String> {

    // Get all applications for a work
    List<Application> findByWorkId(String workId);

    // Get all applications by a user
    List<Application> findByApplicantId(String applicantId);

    // Check if user already applied
    boolean existsByWorkIdAndApplicantId(String workId, String applicantId);
}