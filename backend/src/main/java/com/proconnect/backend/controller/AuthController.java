package com.proconnect.backend.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.proconnect.backend.dto.LoginRequest;
import com.proconnect.backend.dto.LoginResponse;
import com.proconnect.backend.dto.MessageResponse;
import com.proconnect.backend.dto.SignupRequest;
import com.proconnect.backend.service.AuthService;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public MessageResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}