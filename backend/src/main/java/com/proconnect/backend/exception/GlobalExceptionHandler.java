package com.proconnect.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        ex.printStackTrace();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Uploaded image is too large. Please use a smaller image.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace();

        Map<String, String> response = new HashMap<>();
        String message = ex.getMessage() != null ? ex.getMessage() : "Something went wrong";
        response.put("message", message);

        HttpStatus status;
        if (message.contains("not found") || message.contains("Invalid password")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (message.contains("already registered") || message.contains("already exists")) {
            status = HttpStatus.CONFLICT;
        } else if (message.contains("banned") || message.contains("suspended")) {
            status = HttpStatus.FORBIDDEN;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        ex.printStackTrace();

        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage() != null ? ex.getMessage() : "Something went wrong");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}