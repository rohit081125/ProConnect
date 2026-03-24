package com.proconnect.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.model.Chat;
import com.proconnect.backend.service.ChatService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public Chat sendMessage(@RequestBody Chat chat) {
        return chatService.sendMessage(chat);
    }

    @GetMapping("/{user1}/{user2}")
    public List<Chat> getMessages(
            @PathVariable String user1,
            @PathVariable String user2
    ) {
        return chatService.getMessages(user1, user2);
    }

    @PatchMapping("/read")
    public void markMessagesAsRead(
            @RequestParam String senderId,
            @RequestParam String receiverId
    ) {
        chatService.markMessagesAsRead(senderId, receiverId);
    }

    @PostMapping("/upload")
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = chatService.uploadFile(file);
        return Map.of("url", url);
    }
}