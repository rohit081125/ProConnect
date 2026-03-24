package com.proconnect.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.CreateReviewRequest;
import com.proconnect.backend.model.Application;
import com.proconnect.backend.model.Review;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.ReviewRepository;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Review createReview(CreateReviewRequest request) {
        if (request.getApplicationId() == null || request.getApplicationId().trim().isEmpty()) {
            throw new RuntimeException("Application ID is required");
        }

        if (request.getReviewerId() == null || request.getReviewerId().trim().isEmpty()) {
            throw new RuntimeException("Reviewer ID is required");
        }

        if (request.getReviewedUserId() == null || request.getReviewedUserId().trim().isEmpty()) {
            throw new RuntimeException("Reviewed user ID is required");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"completed".equalsIgnoreCase(application.getStatus())) {
            throw new RuntimeException("Review can only be submitted after completion");
        }

        if (reviewRepository.existsByApplicationIdAndReviewerId(request.getApplicationId(), request.getReviewerId())) {
            throw new RuntimeException("You have already reviewed this application");
        }

        Review review = new Review();
        review.setApplicationId(request.getApplicationId());
        review.setWorkId(request.getWorkId() != null ? request.getWorkId() : application.getWorkId());
        review.setReviewerId(request.getReviewerId());
        review.setReviewedUserId(request.getReviewedUserId());
        review.setReviewerRole(request.getReviewerRole());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        if ("client".equalsIgnoreCase(request.getReviewerRole())) {
            application.setClientRated(true);
        } else if ("freelancer".equalsIgnoreCase(request.getReviewerRole())) {
            application.setFreelancerRated(true);
        }

        applicationRepository.save(application);

        return savedReview;
    }

    public List<Review> getReviewsByUser(String userId) {
        return reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> getReviewSummaryByUser(String userId) {
        List<Review> reviews = reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId);

        double averageRating = 0.0;
        int totalReviews = reviews.size();

        if (totalReviews > 0) {
            int sum = 0;
            for (Review review : reviews) {
                sum += review.getRating();
            }
            averageRating = (double) sum / totalReviews;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", averageRating);
        summary.put("totalReviews", totalReviews);
        summary.put("reviews", reviews);

        return summary;
    }
}