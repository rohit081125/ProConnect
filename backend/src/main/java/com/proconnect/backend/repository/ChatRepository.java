package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Chat;

public interface ChatRepository extends MongoRepository<Chat, String> {

    List<Chat> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
        String senderId, String receiverId,
        String receiverId2, String senderId2
    );
    List<Chat> findBySenderIdAndReceiverId(String senderId, String receiverId);
}