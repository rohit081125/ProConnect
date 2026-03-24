package com.proconnect.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.proconnect.backend.model.Notification;
import com.proconnect.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5000")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get all notifications
    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable String userId) {
        return notificationService.getUserNotifications(userId);
    }

    // Get unread count
    @GetMapping("/unread-count/{userId}")
    public Map<String, Long> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);

        return response;
    }

    // Mark one as read
    @PutMapping("/mark-read/{notificationId}")
    public Notification markAsRead(@PathVariable String notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    // Mark all as read
    @PutMapping("/mark-all-read/{userId}")
    public Map<String, String> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");

        return response;
    }
}