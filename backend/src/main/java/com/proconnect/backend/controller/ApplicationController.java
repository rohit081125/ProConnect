package com.proconnect.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.proconnect.backend.dto.CreateApplicationRequest;
import com.proconnect.backend.model.Application;
import com.proconnect.backend.service.ApplicationService;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public Application createApplication(@RequestBody CreateApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    @GetMapping("/work/{workId}")
    public List<Application> getApplicationsByWorkId(@PathVariable String workId) {
        return applicationService.getApplicationsByWorkId(workId);
    }

    @GetMapping("/applicant/{applicantId}")
    public List<Application> getApplicationsByApplicantId(@PathVariable String applicantId) {
        return applicationService.getApplicationsByApplicantId(applicantId);
    }

    @PatchMapping("/{applicationId}/accept")
    public Application acceptApplication(@PathVariable String applicationId) {
        return applicationService.acceptApplication(applicationId);
    }

    @PatchMapping("/{applicationId}/reject")
    public Application rejectApplication(@PathVariable String applicationId) {
        return applicationService.rejectApplication(applicationId);
    }

    @PatchMapping("/{applicationId}/request-completion")
    public Application requestCompletion(
            @PathVariable String applicationId,
            @RequestParam String clientId
    ) {
        return applicationService.requestCompletion(applicationId, clientId);
    }

    @PatchMapping("/{applicationId}/accept-completion")
    public Application acceptCompletion(
            @PathVariable String applicationId,
            @RequestParam String freelancerId
    ) {
        return applicationService.acceptCompletion(applicationId, freelancerId);
    }

    @PatchMapping("/{applicationId}/reject-completion")
    public Application rejectCompletion(
            @PathVariable String applicationId,
            @RequestParam String freelancerId
    ) {
        return applicationService.rejectCompletion(applicationId, freelancerId);
    }

    @DeleteMapping("/{applicationId}")
    public String deleteApplication(@PathVariable String applicationId) {
        return applicationService.deleteApplication(applicationId);
    }
}