package com.proconnect.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proconnect.backend.model.Notification;
import com.proconnect.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Create notification
    public Notification createNotification(
            String userId,
            String senderId,
            String workId,
            String applicationId,
            String type,
            String message
    ) {
        Notification notification = new Notification(
                userId,
                senderId,
                workId,
                applicationId,
                type,
                message
        );

        return notificationRepository.save(notification);
    }

    // Get all notifications (latest first)
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Count unread notifications
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // Mark single notification as read
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
        }

        return notificationRepository.save(notification);
    }

    // Mark all as read
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }

        notificationRepository.saveAll(notifications);
    }
}