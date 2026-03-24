package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.proconnect.backend.model.Chat;
import com.proconnect.backend.repository.ChatRepository;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public Chat sendMessage(Chat chat) {
        if (chat.getSenderId() == null || chat.getSenderId().trim().isEmpty()) {
            throw new RuntimeException("Sender ID is required");
        }

        if (chat.getReceiverId() == null || chat.getReceiverId().trim().isEmpty()) {
            throw new RuntimeException("Receiver ID is required");
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

        return chatRepository.save(chat);
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
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.emptyMap()
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }
}