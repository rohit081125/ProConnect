package com.proconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        System.out.println("=================================================");
        System.out.println("SENDING REAL EMAIL OTP TO: " + toEmail + " -> CODE: " + otpCode);
        System.out.println("=================================================");

        if (mailSender == null || fromEmail == null || fromEmail.isBlank() || fromEmail.contains("YOUR_GMAIL")) {
            System.err.println("WARNING: Email Sender credentials are not configured or still set to defaults in application.properties. Logging/printing OTP in console only.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ProConnect - Verification Code");
            message.setText("Hello,\n\nYour ProConnect verification code is: " + otpCode + "\n\nThis code will expire in 5 minutes.\n\nThank you,\nProConnect Team");
            mailSender.send(message);
            System.out.println("SUCCESS: Real Email OTP sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send real Email OTP to " + toEmail + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
