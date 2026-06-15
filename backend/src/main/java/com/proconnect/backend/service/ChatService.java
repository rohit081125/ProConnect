package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.proconnect.backend.model.Chat;
import com.proconnect.backend.model.User;
import com.proconnect.backend.repository.ChatRepository;
import com.proconnect.backend.repository.UserRepository;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatService(ChatRepository chatRepository, UserService userService, UserRepository userRepository, NotificationService notificationService) {
        this.chatRepository = chatRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Chat sendMessage(Chat chat) {
        if (chat.getSenderId() == null || chat.getSenderId().trim().isEmpty()) {
            throw new RuntimeException("Sender ID is required");
        }

        if (chat.getReceiverId() == null || chat.getReceiverId().trim().isEmpty()) {
            throw new RuntimeException("Receiver ID is required");
        }

        User sender = userRepository.findById(chat.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(chat.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        boolean isSenderAdmin = "admin".equalsIgnoreCase(sender.getRole());
        boolean isReceiverAdmin = "admin".equalsIgnoreCase(receiver.getRole());

        if (!isSenderAdmin && !isReceiverAdmin) {
            userService.requireActiveUser(chat.getSenderId());
            userService.requireActiveUser(chat.getReceiverId());
        }

        if (chat.getType() == null || chat.getType().trim().isEmpty()) {
            chat.setType("text");
        }

        String type = chat.getType().trim();

        if (type.equals("text")) {
            if (chat.getMessage() == null || chat.getMessage().trim().isEmpty()) {
                throw new RuntimeException("Message cannot be empty");
            }
            chat.setMessage(chat.getMessage().trim());
        } else if (type.equals("image") || type.equals("file")) {
            if (chat.getFileUrl() == null || chat.getFileUrl().trim().isEmpty()) {
                throw new RuntimeException("File URL is required");
            }

            if (chat.getMessage() != null) {
                chat.setMessage(chat.getMessage().trim());
            }
        } else {
            throw new RuntimeException("Invalid chat type");
        }

        if (chat.getCreatedAt() == null) {
            chat.setCreatedAt(LocalDateTime.now());
        }

        if (chat.getIsRead() == null) {
            chat.setIsRead(false);
        }

        Chat savedChat = chatRepository.save(chat);
        return savedChat;
    }

    public List<Chat> getMessages(String user1, String user2) {
        return chatRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
                user1, user2, user1, user2
        );
    }

    public void markMessagesAsRead(String senderId, String receiverId) {
        List<Chat> chats = chatRepository.findBySenderIdAndReceiverId(senderId, receiverId);

        for (Chat chat : chats) {
            if (chat.getIsRead() == null || !chat.getIsRead()) {
                chat.setIsRead(true);
            }
        }

        chatRepository.saveAll(chats);
    }

    public String uploadFile(MultipartFile file) {
        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", "dd4s9ife4",
                    "api_key", "541583497765428",
                    "api_secret", "zbpuzF6gwkJ7ZJrCr0_pAINQQ5k"
            ));

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    public List<com.proconnect.backend.dto.UserResponse> getAdminThreads() {
        String adminEmail = "rohitdongre1108@gmail.com";
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        List<Chat> chats = chatRepository.findBySenderIdOrReceiverId(admin.getId(), admin.getId());
        List<String> userIds = chats.stream()
                .map(chat -> chat.getSenderId().equals(admin.getId()) ? chat.getReceiverId() : chat.getSenderId())
                .distinct()
                .collect(Collectors.toList());

        return userRepository.findAllById(userIds).stream()
                .map(userService::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<com.proconnect.backend.dto.UserResponse> getUserThreads(String userId) {
        List<Chat> chats = chatRepository.findBySenderIdOrReceiverId(userId, userId);
        List<String> userIds = chats.stream()
                .map(chat -> chat.getSenderId().equals(userId) ? chat.getReceiverId() : chat.getSenderId())
                .distinct()
                .collect(Collectors.toList());

        return userRepository.findAllById(userIds).stream()
                .map(userService::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadMessageCount(String userId) {
        return chatRepository.countByReceiverIdAndIsRead(userId, false);
    }
}
