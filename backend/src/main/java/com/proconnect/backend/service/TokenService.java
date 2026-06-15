package com.proconnect.backend.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private static final String SECRET_KEY = "ProConnectSuperSecretKeyForTokenSigning";
    private static final long EXPIRATION_HOURS = 24;

    public String generateToken(String userId, String email, String role) {
        long expiresAt = LocalDateTime.now().plusHours(EXPIRATION_HOURS).toEpochSecond(ZoneOffset.UTC);
        String payload = userId + ":" + email + ":" + role + ":" + expiresAt;
        String signature = hmacSha256(payload, SECRET_KEY);
        String token = payload + ":" + signature;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String base64Token) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(base64Token), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");
            if (parts.length != 5) {
                return false;
            }
            long expiresAt = Long.parseLong(parts[3]);
            String signature = parts[4];

            // Verify expiration
            if (expiresAt < LocalDateTime.now().toEpochSecond(ZoneOffset.UTC)) {
                return false;
            }

            // Verify signature
            String payload = parts[0] + ":" + parts[1] + ":" + parts[2] + ":" + expiresAt;
            String expectedSignature = hmacSha256(payload, SECRET_KEY);
            return expectedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public TokenData parseToken(String base64Token) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(base64Token), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");
            return new TokenData(parts[0], parts[1], parts[2]);
        } catch (Exception e) {
            return null;
        }
    }

    private String hmacSha256(String data, String key) {
        try {
            byte[] hash = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(hash, "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKey);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("HMAC signing failed", e);
        }
    }

    public static class TokenData {
        public final String userId;
        public final String email;
        public final String role;

        public TokenData(String userId, String email, String role) {
            this.userId = userId;
            this.email = email;
            this.role = role;
        }
    }
}
