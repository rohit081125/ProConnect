package com.proconnect.backend.dto;

public class SignupOtpRequest {
    private String email;
    private String otp;

    public SignupOtpRequest() {
    }

    public SignupOtpRequest(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
