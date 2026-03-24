package com.proconnect.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String applicationId;
    private String workId;

    private String reviewerId;
    private String reviewedUserId;

    private String reviewerRole;
    private int rating;
    private String comment;

    private LocalDateTime createdAt;

    public Review() {
        this.createdAt = LocalDateTime.now();
    }

    // ===== GETTERS =====

    public String getId() {
        return id;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public String getWorkId() {
        return workId;
    }

    public String getReviewerId() {
        return reviewerId;
    }

    public String getReviewedUserId() {
        return reviewedUserId;
    }

    public String getReviewerRole() {
        return reviewerRole;
    }

    public int getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ===== SETTERS =====

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public void setWorkId(String workId) {
        this.workId = workId;
    }

    public void setReviewerId(String reviewerId) {
        this.reviewerId = reviewerId;
    }

    public void setReviewedUserId(String reviewedUserId) {
        this.reviewedUserId = reviewedUserId;
    }

    public void setReviewerRole(String reviewerRole) {
        this.reviewerRole = reviewerRole;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}