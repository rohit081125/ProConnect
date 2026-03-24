package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {

    boolean existsByApplicationIdAndReviewerId(String applicationId, String reviewerId);

    List<Review> findByReviewedUserIdOrderByCreatedAtDesc(String reviewedUserId);
}