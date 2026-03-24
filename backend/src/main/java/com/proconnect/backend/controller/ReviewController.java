package com.proconnect.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.proconnect.backend.dto.CreateReviewRequest;
import com.proconnect.backend.model.Review;
import com.proconnect.backend.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public Map<String, Object> createReview(@RequestBody CreateReviewRequest request) {
        Review savedReview = reviewService.createReview(request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Review submitted successfully");
        response.put("review", savedReview);

        return response;
    }

    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUser(@PathVariable String userId) {
        return reviewService.getReviewsByUser(userId);
    }

    @GetMapping("/user/{userId}/summary")
    public Map<String, Object> getReviewSummaryByUser(@PathVariable String userId) {
        return reviewService.getReviewSummaryByUser(userId);
    }
}