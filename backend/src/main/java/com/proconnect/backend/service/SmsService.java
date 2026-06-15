package com.proconnect.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;

@Service
public class SmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpSms(String toPhoneNumber, String otpCode) {
        System.out.println("=================================================");
        System.out.println("SENDING REAL SMS OTP TO: " + toPhoneNumber + " -> CODE: " + otpCode);
        System.out.println("=================================================");

        if (accountSid == null || accountSid.isBlank() || accountSid.contains("YOUR_TWILIO") ||
            authToken == null || authToken.isBlank() || authToken.contains("YOUR_TWILIO") ||
            twilioPhoneNumber == null || twilioPhoneNumber.isBlank() || twilioPhoneNumber.contains("YOUR_TWILIO")) {
            System.err.println("WARNING: Twilio SMS Service credentials are not configured or set to default placeholders in application.properties.");
            return;
        }

        try {
            // E.164 conversion
            String formattedPhone = toPhoneNumber.trim();
            if (!formattedPhone.startsWith("+")) {
                if (formattedPhone.length() == 10) {
                    formattedPhone = "+91" + formattedPhone;
                } else if (formattedPhone.length() == 12 && formattedPhone.startsWith("91")) {
                    formattedPhone = "+" + formattedPhone;
                } else {
                    formattedPhone = "+" + formattedPhone;
                }
            }

            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Basic Auth Header
            String auth = accountSid + ":" + authToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("To", formattedPhone);
            map.add("From", twilioPhoneNumber.trim());
            map.add("Body", "Your ProConnect verification code is: " + otpCode + ". This code expires in 5 minutes.");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            System.out.println("SUCCESS: Real SMS OTP sent successfully to " + formattedPhone + ". Response: " + response.getBody());
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send real SMS OTP via Twilio to " + toPhoneNumber + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
