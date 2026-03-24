package com.proconnect.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.dto.UpdateUserRequest;
import com.proconnect.backend.dto.UserResponse;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserResponse(user);
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

    private UserResponse mapToUserResponse(User user) {
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
                user.getCreatedAt());
    }
}