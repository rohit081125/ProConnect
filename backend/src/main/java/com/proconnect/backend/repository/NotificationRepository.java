package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);
}