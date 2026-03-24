package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.LoginRequest;
import com.proconnect.backend.dto.LoginResponse;
import com.proconnect.backend.dto.MessageResponse;
import com.proconnect.backend.dto.SignupRequest;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public MessageResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setBio("");
        user.setSkills(new ArrayList<>());
        user.setLocation("");
        user.setPortfolioLinks(new ArrayList<>());
        user.setSocialLinks(new ArrayList<>());
        user.setEducation("");
        user.setExperience("");
        user.setProfileImage("");
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new MessageResponse("User registered successfully");
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = null; // replace with JWT token if you generate one elsewhere

        return new LoginResponse(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfileImage(),
                token
        );
    }
}