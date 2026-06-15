package com.proconnect.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proconnect.backend.dto.AdminUserActionRequest;
import com.proconnect.backend.dto.UserResponse;
import com.proconnect.backend.repository.ApplicationRepository;
import com.proconnect.backend.repository.ReportRepository;
import com.proconnect.backend.repository.UserRepository;
import com.proconnect.backend.repository.WorkRepository;
import com.proconnect.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final WorkRepository workRepository;
    private final ApplicationRepository applicationRepository;
    private final ReportRepository reportRepository;

    public AdminController(
            UserService userService,
            UserRepository userRepository,
            WorkRepository workRepository,
            ApplicationRepository applicationRepository,
            ReportRepository reportRepository
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.workRepository = workRepository;
        this.applicationRepository = applicationRepository;
        this.reportRepository = reportRepository;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users", userRepository.count());
        stats.put("activeUsers", userRepository.findByAccountStatus("active").size());
        stats.put("bannedUsers", userRepository.findByAccountStatus("banned").size());
        stats.put("suspendedUsers", userRepository.findByAccountStatus("suspended").size());
        stats.put("works", workRepository.count());
        stats.put("applications", applicationRepository.count());
        stats.put("reports", reportRepository.count());
        stats.put("openReports", reportRepository.findByStatusOrderByCreatedAtDesc("open").size());
        return stats;
    }

    @PatchMapping("/users/{id}/ban")
    public UserResponse banUser(@PathVariable String id, @RequestBody(required = false) AdminUserActionRequest request) {
        return userService.banUser(id, request);
    }

    @PatchMapping("/users/{id}/unban")
    public UserResponse unbanUser(@PathVariable String id, @RequestBody(required = false) AdminUserActionRequest request) {
        return userService.unbanUser(id, request);
    }

    @PatchMapping("/users/{id}/suspend")
    public UserResponse suspendUser(@PathVariable String id, @RequestBody(required = false) AdminUserActionRequest request) {
        return userService.suspendUser(id, request);
    }

    @PatchMapping("/users/{id}/warn")
    public UserResponse warnUser(@PathVariable String id, @RequestBody(required = false) AdminUserActionRequest request) {
        return userService.warnUser(id, request);
    }
}
