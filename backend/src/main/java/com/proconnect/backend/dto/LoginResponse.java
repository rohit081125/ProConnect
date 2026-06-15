package com.proconnect.backend.dto;

public class LoginResponse {

    private String message;
    private String userId;
    private String name;
    private String email;
    private String role;
    private String accountStatus;
    private String profileImage;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(String message, String userId, String name, String email, String role, String accountStatus, String profileImage, String token) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.profileImage = profileImage;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public String getToken() {
        return token;
    }
}
