package com.proconnect.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.DashboardResponse;
import com.proconnect.backend.model.Work;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.WorkRepository;

@Service
public class DashboardService {

    private final WorkRepository workRepository;
    private final ApplicationRepository applicationRepository;

    public DashboardService(WorkRepository workRepository, ApplicationRepository applicationRepository) {
        this.workRepository = workRepository;
        this.applicationRepository = applicationRepository;
    }

    public DashboardResponse getDashboard(String userId) {
        long worksPosted = workRepository.findByPostedBy(userId).size();
        long applicationsSent = applicationRepository.findByApplicantId(userId).size();

        List<Work> userWorks = workRepository.findByPostedBy(userId);

        long applicationsReceived = 0;
        for (Work work : userWorks) {
            applicationsReceived += applicationRepository.findByWorkId(work.getId()).size();
        }

        return new DashboardResponse(worksPosted, applicationsSent, applicationsReceived);
    }
}