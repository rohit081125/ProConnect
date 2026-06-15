package com.proconnect.backend.config;

import com.proconnect.backend.dto.SignupRequest;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.UserRepository;
import com.proconnect.backend.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class AdminAccountInitializer {

    @Bean
    public CommandLineRunner createAdminAccount(
            UserRepository userRepository, 
            AuthService authService,
            PasswordEncoder passwordEncoder) {
        return args -> {
            final String ADMIN_EMAIL = "rohitdongre1108@gmail.com";
            final String ADMIN_PASSWORD = "rohit0811";
            final String ADMIN_ROLE = "ADMIN";

            Optional<User> existingUser = userRepository.findByEmail(ADMIN_EMAIL);
            if (existingUser.isEmpty()) {
                SignupRequest adminSignupRequest = new SignupRequest();
                adminSignupRequest.setName("ProConnect Admin");
                adminSignupRequest.setEmail(ADMIN_EMAIL);
                adminSignupRequest.setPassword(ADMIN_PASSWORD);
                adminSignupRequest.setRole(ADMIN_ROLE);
                authService.signup(adminSignupRequest);
                System.out.println("Admin account created: " + ADMIN_EMAIL);
            } else {
                User admin = existingUser.get();
                admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                admin.setRole(ADMIN_ROLE);
                admin.setAccountStatus("active");
                userRepository.save(admin);
                System.out.println("Admin account updated to active and password reset: " + ADMIN_EMAIL);
            }
        };
    }
}
