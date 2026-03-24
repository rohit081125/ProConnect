package com.proconnect.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.dto.UpdateUserRequest;
import com.proconnect.backend.dto.UserResponse;
import com.proconnect.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @PutMapping("/{id}/profile-image")
    public UserResponse updateProfileImage(@PathVariable String id, @RequestParam("image") MultipartFile image) {
        return userService.updateProfileImage(id, image);
    }
}