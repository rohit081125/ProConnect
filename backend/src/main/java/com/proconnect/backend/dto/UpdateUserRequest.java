package com.proconnect.backend.dto;

import java.util.List;

public class UpdateUserRequest {

    private String name;
    private String bio;
    private List<String> skills;
    private String location;
    private List<String> portfolioLinks;
    private List<String> socialLinks;
    private String education;
    private String experience;
    private String profileImage; // 🔥 IMPORTANT

    public UpdateUserRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    // 🔥 NEW GETTER/SETTER

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}