package com.shop.backend.controller;

import com.shop.backend.dto.ChatMessageRequest;
import com.shop.backend.dto.ChatRoomRequest;
import com.shop.backend.entity.ChatMessage;
import com.shop.backend.response.ChatMessageResponse;
import com.shop.backend.response.ChatRoomDetailResponse;
import com.shop.backend.response.ChatRoomInfoResponse;
import com.shop.backend.response.ChatRoomResponse;
import com.shop.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate; // WebSocket 메시지 브로커로 메시지를 보내는 데 사용

    // REST API: 채팅방 생성 또는 조회
    @PostMapping("/chat/rooms")
    public ResponseEntity<ChatRoomResponse> createOrGetRoom(@RequestBody ChatRoomRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Long roomId = chatService.findOrCreateRoom(request.getProductId(), userDetails.getUsername());
        return ResponseEntity.ok(new ChatRoomResponse(roomId));
    }

    // REST API: 특정 채팅방의 이전 메시지 내역 조회
    @GetMapping("/chat/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getRoomMessages(@PathVariable Long roomId) {
        List<ChatMessageResponse> messages = chatService.getMessages(roomId);
        return ResponseEntity.ok(messages);
    }

    // WebSocket 매핑: 메시지 전송
    @MessageMapping("/chat/send")
    // SimpMessageHeaderAccessor 대신 Principal을 직접 받도록 변경
    public void sendMessage(ChatMessageRequest messageRequest, SimpMessageHeaderAccessor headerAccessor) {
        // StompHandler에서 저장한 세션 속성에서 유저 이름을 가져옵니다.
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        // 메시지를 DB에 저장
        ChatMessage savedMessage = chatService.saveMessage(messageRequest, username);

        // DTO로 변환
        ChatMessageResponse messageResponse = new ChatMessageResponse(savedMessage);

        // 해당 채팅방을 구독하고 있는 클라이언트에게 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + messageRequest.getRoomId(), messageResponse);
    }

    // REST API: 내 채팅방 목록 조회
    @GetMapping("/chat/my-rooms")
    public ResponseEntity<List<ChatRoomInfoResponse>> getMyRooms(Principal principal) {
        List<ChatRoomInfoResponse> myRooms = chatService.getMyChatRooms(principal.getName());
        return ResponseEntity.ok(myRooms);
    }

    @GetMapping("/chat/rooms/{roomId}")
    public ResponseEntity<ChatRoomDetailResponse> getRoomDetails(@PathVariable Long roomId) {
        ChatRoomDetailResponse roomDetails = chatService.getChatRoomDetails(roomId);
        return ResponseEntity.ok(roomDetails);
    }
}