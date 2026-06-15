package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.dto.AdminUserActionRequest;
import com.proconnect.backend.dto.UpdateUserRequest;
import com.proconnect.backend.dto.UserResponse;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    public UserService(
            UserRepository userRepository,
            CloudinaryService cloudinaryService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.notificationService = notificationService;
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Auto-reactivate if suspension has expired
        String accountStatus = user.getAccountStatus() != null ? user.getAccountStatus() : "active";
        if ("suspended".equalsIgnoreCase(accountStatus)) {
            if (user.getSuspendedUntil() != null && !user.getSuspendedUntil().isAfter(java.time.LocalDateTime.now())) {
                user.setAccountStatus("active");
                user.setSuspendedUntil(null);
                user = userRepository.save(user);
            }
        }

        return mapToUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public void requireActiveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertUserCanAccess(user);
    }

    public UserResponse banUser(String id, AdminUserActionRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAccountStatus("banned");
        user.setSuspendedUntil(null);
        String banMessage = request != null && request.getNote() != null ? request.getNote() : "Banned by admin";
        user.setAdminNote(banMessage);

        User savedUser = userRepository.save(user);

        try {
            User admin = userRepository.findByEmail("rohitdongre1108@gmail.com").orElse(null);
            String adminId = admin != null ? admin.getId() : "admin";

            notificationService.createNotification(
                    id,              // target user id
                    adminId,         // sender
                    null,            // workId
                    null,            // applicationId
                    "ban",           // type
                    "Your account has been banned: " + banMessage
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToUserResponse(savedUser);
    }

    public UserResponse unbanUser(String id, AdminUserActionRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAccountStatus("active");
        user.setSuspendedUntil(null);
        String restoreMessage = request != null && request.getNote() != null ? request.getNote() : "Account restored";
        user.setAdminNote(restoreMessage);

        User savedUser = userRepository.save(user);

        try {
            User admin = userRepository.findByEmail("rohitdongre1108@gmail.com").orElse(null);
            String adminId = admin != null ? admin.getId() : "admin";

            notificationService.createNotification(
                    id,              // target user id
                    adminId,         // sender
                    null,            // workId
                    null,            // applicationId
                    "restore",       // type
                    "Your account has been restored: " + restoreMessage
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToUserResponse(savedUser);
    }

    public UserResponse suspendUser(String id, AdminUserActionRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int days = request != null && request.getSuspendDays() != null && request.getSuspendDays() > 0
                ? request.getSuspendDays()
                : 7;

        user.setAccountStatus("suspended");
        user.setSuspendedUntil(LocalDateTime.now().plusDays(days));
        String suspendMessage = request != null && request.getNote() != null ? request.getNote() : "Suspended by admin";
        user.setAdminNote(suspendMessage);

        User savedUser = userRepository.save(user);

        try {
            User admin = userRepository.findByEmail("rohitdongre1108@gmail.com").orElse(null);
            String adminId = admin != null ? admin.getId() : "admin";

            notificationService.createNotification(
                    id,              // target user id
                    adminId,         // sender
                    null,            // workId
                    null,            // applicationId
                    "suspension",    // type
                    "Your account has been suspended: " + suspendMessage
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToUserResponse(savedUser);
    }

    public UserResponse warnUser(String id, AdminUserActionRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setWarningCount((user.getWarningCount() != null ? user.getWarningCount() : 0) + 1);
        String warnMessage = request != null && request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Warning sent by admin";
        user.setAdminNote(warnMessage);

        User savedUser = userRepository.save(user);

        try {
            // Find the admin user to get their ID as the sender
            User admin = userRepository.findByEmail("rohitdongre1108@gmail.com").orElse(null);
            String adminId = admin != null ? admin.getId() : "admin";

            notificationService.createNotification(
                    id,              // target user id
                    adminId,         // sender
                    null,            // workId
                    null,            // applicationId
                    "warning",       // type
                    warnMessage      // message
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToUserResponse(savedUser);
    }

    public UserResponse updateUser(String id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }

        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }

        if (request.getPortfolioLinks() != null) {
            user.setPortfolioLinks(request.getPortfolioLinks());
        }

        if (request.getSocialLinks() != null) {
            user.setSocialLinks(request.getSocialLinks());
        }

        if (request.getEducation() != null) {
            user.setEducation(request.getEducation());
        }

        if (request.getExperience() != null) {
            user.setExperience(request.getExperience());
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public UserResponse updateProfileImage(String id, MultipartFile image) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = cloudinaryService.uploadProfileImage(image);
        user.setProfileImage(imageUrl);

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public UserResponse getAdminUser() {
        User admin = userRepository.findByEmail("rohitdongre1108@gmail.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        return mapToUserResponse(admin);
    }

    public UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getBio(),
                user.getSkills(),
                user.getLocation(),
                user.getPortfolioLinks(),
                user.getSocialLinks(),
                user.getEducation(),
                user.getExperience(),
                user.getProfileImage(),
                user.getAccountStatus() != null ? user.getAccountStatus() : "active",
                user.getWarningCount() != null ? user.getWarningCount() : 0,
                user.getAdminNote(),
                user.getSuspendedUntil(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getPhoneNumber());
    }

    private void assertUserCanAccess(User user) {
        String status = user.getAccountStatus() != null ? user.getAccountStatus() : "active";

        if ("banned".equalsIgnoreCase(status)) {
            throw new RuntimeException("This account has been banned");
        }

        if ("suspended".equalsIgnoreCase(status)) {
            LocalDateTime suspendedUntil = user.getSuspendedUntil();
            if (suspendedUntil != null && suspendedUntil.isAfter(LocalDateTime.now())) {
                throw new RuntimeException("This account is suspended until " + suspendedUntil);
            }

            user.setAccountStatus("active");
            user.setSuspendedUntil(null);
            userRepository.save(user);
        }
    }
}
