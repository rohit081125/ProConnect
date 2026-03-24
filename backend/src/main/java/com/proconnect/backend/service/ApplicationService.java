package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.CreateApplicationRequest;
import com.proconnect.backend.model.Application;
import com.proconnect.backend.model.User;
import com.proconnect.backend.model.Work;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.UserRepository;
import com.proconnect.backend.repository.WorkRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final WorkRepository workRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            WorkRepository workRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.workRepository = workRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Application createApplication(CreateApplicationRequest request) {
        if (request.getWorkId() == null || request.getWorkId().trim().isEmpty()) {
            throw new RuntimeException("Work ID is required");
        }

        if (request.getApplicantId() == null || request.getApplicantId().trim().isEmpty()) {
            throw new RuntimeException("Applicant ID is required");
        }

        if (request.getProposalMessage() == null || request.getProposalMessage().trim().isEmpty()) {
            throw new RuntimeException("Proposal message is required");
        }

        boolean alreadyExists = applicationRepository.existsByWorkIdAndApplicantId(
                request.getWorkId(),
                request.getApplicantId()
        );

        if (alreadyExists) {
            throw new RuntimeException("You have already applied to this work");
        }

        Work work = workRepository.findById(request.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        User applicant = userRepository.findById(request.getApplicantId())
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        Application application = new Application();
        application.setWorkId(request.getWorkId());
        application.setApplicantId(request.getApplicantId());
        application.setProposalMessage(request.getProposalMessage().trim());
        application.setReferenceLink(
                request.getReferenceLink() != null ? request.getReferenceLink().trim() : ""
        );
        application.setSkillsUsed(request.getSkillsUsed());
        application.setCounterPrice(request.getCounterPrice());
        application.setStatus("pending");
        application.setCreatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);

        // Notification for project owner
        notificationService.createNotification(
                work.getPostedBy(),
                applicant.getId(),
                work.getId(),
                savedApplication.getId(),
                "NEW_APPLICATION_ON_PROJECT",
                applicant.getName() + " sent a request to your project: " + work.getTitle()
        );

        // Notification for applicant
        notificationService.createNotification(
                applicant.getId(),
                work.getPostedBy(),
                work.getId(),
                savedApplication.getId(),
                "APPLICATION_SENT",
                "Your request was sent for project: " + work.getTitle()
        );

        return savedApplication;
    }

    public List<Application> getApplicationsByWorkId(String workId) {
        return applicationRepository.findByWorkId(workId);
    }

    public List<Application> getApplicationsByApplicantId(String applicantId) {
        return applicationRepository.findByApplicantId(applicantId);
    }

    public Application acceptApplication(String applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus("accepted");
        Application updatedApplication = applicationRepository.save(application);

        Work work = workRepository.findById(application.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        notificationService.createNotification(
                application.getApplicantId(),
                work.getPostedBy(),
                work.getId(),
                application.getId(),
                "APPLICATION_ACCEPTED",
                "Your application was accepted for project: " + work.getTitle()
        );

        return updatedApplication;
    }

    public Application rejectApplication(String applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus("rejected");
        Application updatedApplication = applicationRepository.save(application);

        Work work = workRepository.findById(application.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        notificationService.createNotification(
                application.getApplicantId(),
                work.getPostedBy(),
                work.getId(),
                application.getId(),
                "APPLICATION_REJECTED",
                "Your application was rejected for project: " + work.getTitle()
        );

        return updatedApplication;
    }

    public Application requestCompletion(String applicationId, String clientId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"accepted".equals(application.getStatus())) {
            throw new RuntimeException("Only accepted applications can request completion");
        }

        Work work = workRepository.findById(application.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        if (!work.getPostedBy().equals(clientId)) {
            throw new RuntimeException("Only client can request completion");
        }

        application.setStatus("completion_requested");
        application.setCompletionRequestedBy("client");
        application.setCompletionRequestedAt(LocalDateTime.now());

        Application updatedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                application.getApplicantId(),
                clientId,
                work.getId(),
                application.getId(),
                "COMPLETION_REQUESTED",
                "Client requested to mark the project as completed: " + work.getTitle()
        );

        return updatedApplication;
    }

    public Application acceptCompletion(String applicationId, String freelancerId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"completion_requested".equals(application.getStatus())) {
            throw new RuntimeException("No completion request found");
        }

        if (!application.getApplicantId().equals(freelancerId)) {
            throw new RuntimeException("Only freelancer can accept completion");
        }

        Work work = workRepository.findById(application.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        application.setStatus("completed");
        application.setCompletedAt(LocalDateTime.now());

        Application updatedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                work.getPostedBy(),
                freelancerId,
                work.getId(),
                application.getId(),
                "PROJECT_COMPLETED",
                "Freelancer accepted completion request for project: " + work.getTitle()
        );

        return updatedApplication;
    }

    public Application rejectCompletion(String applicationId, String freelancerId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"completion_requested".equals(application.getStatus())) {
            throw new RuntimeException("No completion request found");
        }

        if (!application.getApplicantId().equals(freelancerId)) {
            throw new RuntimeException("Only freelancer can reject completion");
        }

        Work work = workRepository.findById(application.getWorkId())
                .orElseThrow(() -> new RuntimeException("Work not found"));

        application.setStatus("accepted");
        application.setCompletionRequestedBy(null);
        application.setCompletionRequestedAt(null);

        Application updatedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                work.getPostedBy(),
                freelancerId,
                work.getId(),
                application.getId(),
                "COMPLETION_REJECTED",
                "Freelancer rejected completion request for project: " + work.getTitle()
        );

        return updatedApplication;
    }

    public String deleteApplication(String applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        applicationRepository.delete(application);
        return "Application deleted successfully";
    }
}