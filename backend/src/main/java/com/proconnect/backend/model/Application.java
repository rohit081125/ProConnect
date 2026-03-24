package com.proconnect.backend.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    private String workId;
    private String applicantId;
    private String proposalMessage;
    private String referenceLink;
    private List<String> skillsUsed;
    private Double counterPrice;

    private String status;
    private LocalDateTime createdAt;

    // completion flow fields
    private String completionRequestedBy;
    private LocalDateTime completionRequestedAt;
    private LocalDateTime completedAt;

    // rating flow fields
    private Boolean clientRated;
    private Boolean freelancerRated;

    public Application() {
        this.createdAt = LocalDateTime.now();
        this.status = "pending";
        this.clientRated = false;
        this.freelancerRated = false;
    }

    // ================= GETTERS =================

    public String getId() {
        return id;
    }

    public String getWorkId() {
        return workId;
    }

    public String getApplicantId() {
        return applicantId;
    }

    public String getProposalMessage() {
        return proposalMessage;
    }

    public String getReferenceLink() {
        return referenceLink;
    }

    public List<String> getSkillsUsed() {
        return skillsUsed;
    }

    public Double getCounterPrice() {
        return counterPrice;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getCompletionRequestedBy() {
        return completionRequestedBy;
    }

    public LocalDateTime getCompletionRequestedAt() {
        return completionRequestedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public Boolean getClientRated() {
        return clientRated;
    }

    public Boolean getFreelancerRated() {
        return freelancerRated;
    }

    // ================= SETTERS =================

    public void setWorkId(String workId) {
        this.workId = workId;
    }

    public void setApplicantId(String applicantId) {
        this.applicantId = applicantId;
    }

    public void setProposalMessage(String proposalMessage) {
        this.proposalMessage = proposalMessage;
    }

    public void setReferenceLink(String referenceLink) {
        this.referenceLink = referenceLink;
    }

    public void setSkillsUsed(List<String> skillsUsed) {
        this.skillsUsed = skillsUsed;
    }

    public void setCounterPrice(Double counterPrice) {
        this.counterPrice = counterPrice;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setCompletionRequestedBy(String completionRequestedBy) {
        this.completionRequestedBy = completionRequestedBy;
    }

    public void setCompletionRequestedAt(LocalDateTime completionRequestedAt) {
        this.completionRequestedAt = completionRequestedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public void setClientRated(Boolean clientRated) {
        this.clientRated = clientRated;
    }

    public void setFreelancerRated(Boolean freelancerRated) {
        this.freelancerRated = freelancerRated;
    }
}