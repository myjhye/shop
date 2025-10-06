package com.shop.backend.response;

import com.shop.backend.entity.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {
    private final Long id;
    private final String message;
    private final LocalDateTime createdAt;
    private final SenderResponse sender; // 보낸 사람 정보

    // 간단한 유저 정보 DTO
    @Getter
    private static class SenderResponse {
        private final Long id;
        private final String username;

        public SenderResponse(Long id, String username) {
            this.id = id;
            this.username = username;
        }
    }

    public ChatMessageResponse(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.message = chatMessage.getMessage();
        this.createdAt = chatMessage.getCreatedAt();
        this.sender = new SenderResponse(
                chatMessage.getSender().getId(),
                chatMessage.getSender().getUsername()
        );
    }
}