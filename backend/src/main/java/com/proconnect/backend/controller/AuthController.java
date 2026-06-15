package com.proconnect.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proconnect.backend.dto.LoginRequest;
import com.proconnect.backend.dto.LoginResponse;
import com.proconnect.backend.dto.MessageResponse;
import com.proconnect.backend.dto.SignupRequest;
import com.proconnect.backend.dto.SignupOtpRequest;
import com.proconnect.backend.service.AuthService;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send-signup-otp")
    public ResponseEntity<MessageResponse> sendSignupOtp(@RequestBody SignupOtpRequest request) {
        MessageResponse response = authService.sendSignupOtp(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-signup-otp")
    public ResponseEntity<MessageResponse> verifySignupOtp(@RequestBody SignupOtpRequest request) {
        MessageResponse response = authService.verifySignupOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<LoginResponse> signup(@RequestBody SignupRequest request) {
        LoginResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
