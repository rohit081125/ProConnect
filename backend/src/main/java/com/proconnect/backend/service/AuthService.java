package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.LoginRequest;
import com.proconnect.backend.dto.LoginResponse;
import com.proconnect.backend.dto.MessageResponse;
import com.proconnect.backend.dto.SignupRequest;
import com.proconnect.backend.dto.SignupOtpRequest;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.UserRepository;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        // Auto-reactivate if suspension has expired
        String accountStatus = user.getAccountStatus() != null ? user.getAccountStatus() : "active";
        if ("suspended".equalsIgnoreCase(accountStatus)) {
            if (user.getSuspendedUntil() != null && !user.getSuspendedUntil().isAfter(LocalDateTime.now())) {
                user.setAccountStatus("active");
                user.setSuspendedUntil(null);
                userRepository.save(user);
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
        );
    }

    public MessageResponse sendSignupOtp(String email) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (!"unverified".equalsIgnoreCase(existingUser.getAccountStatus())) {
                throw new RuntimeException("Email already registered");
            }
        }

        User user = existingUserOpt.orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setAccountStatus("unverified");
            user.setWarningCount(0);
            user.setAdminNote("");
            user.setCreatedAt(LocalDateTime.now());
        }

        // Generate email OTP (random 6 digits)
        String emailOtp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setEmailOtp(emailOtp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        System.out.println("=================================================");
        System.out.println("SIGNUP EMAIL OTP FOR " + email + ": " + emailOtp);
        System.out.println("=================================================");

        // Send real email OTP
        emailService.sendOtpEmail(email, emailOtp);

        return new MessageResponse("OTP sent successfully to " + email);
    }

    public MessageResponse verifySignupOtp(SignupOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please send a new OTP.");
        }

        String enteredOtp = request.getOtp();
        // Must match stored emailOtp exactly (123456 bypass removed).
        boolean isCorrect = user.getEmailOtp() != null && user.getEmailOtp().equals(enteredOtp);

        if (!isCorrect) {
            throw new RuntimeException("Invalid OTP.");
        }

        // Mark as verified
        user.setEmailOtp("VERIFIED");
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return new MessageResponse("Email verified successfully");
    }

    public LoginResponse signup(SignupRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email must be verified first"));

        if (!"VERIFIED".equals(user.getEmailOtp())) {
            throw new RuntimeException("Email must be verified first");
        }

        // Complete user setup
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null && !request.getRole().isBlank() ? request.getRole() : "user");
        user.setBio("");
        user.setSkills(new ArrayList<>());
        user.setLocation("");
        user.setPortfolioLinks(new ArrayList<>());
        user.setSocialLinks(new ArrayList<>());
        user.setEducation("");
        user.setExperience("");
        user.setProfileImage("");
        user.setAccountStatus("active");
        user.setEmailOtp(null); // Clear verification flag
        user.setCreatedAt(LocalDateTime.now());
        user.setPhoneNumber(request.getPhoneNumber());

        userRepository.save(user);

        // Generate token and return direct LoginResponse
        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new LoginResponse(
                "Registration successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                user.getProfileImage(),
                token
        );
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optionalUser.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String status = user.getAccountStatus() != null ? user.getAccountStatus() : "active";

        if ("unverified".equalsIgnoreCase(status)) {
            throw new RuntimeException("Please complete your email verification to activate your account.");
        }

        if ("suspended".equalsIgnoreCase(status)) {
            if (user.getSuspendedUntil() != null && !user.getSuspendedUntil().isAfter(LocalDateTime.now())) {
                user.setAccountStatus("active");
                user.setSuspendedUntil(null);
                userRepository.save(user);
            }
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new LoginResponse(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                user.getProfileImage(),
                token
        );
    }
}
