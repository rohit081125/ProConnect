package com.proconnect.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private String bio;
    private List<String> skills;
    private String location;
    private List<String> portfolioLinks;
    private List<String> socialLinks;
    private String education;
    private String experience;
    private String profileImage;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(
            String id,
            String name,
            String email,
            String role,
            String bio,
            List<String> skills,
            String location,
            List<String> portfolioLinks,
            List<String> socialLinks,
            String education,
            String experience,
            String profileImage,
            LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.bio = bio;
        this.skills = skills;
        this.location = location;
        this.portfolioLinks = portfolioLinks;
        this.socialLinks = socialLinks;
        this.education = education;
        this.experience = experience;
        this.profileImage = profileImage;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getPortfolioLinks() {
        return portfolioLinks;
    }

    public void setPortfolioLinks(List<String> portfolioLinks) {
        this.portfolioLinks = portfolioLinks;
    }

    public List<String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(List<String> socialLinks) {
        this.socialLinks = socialLinks;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}