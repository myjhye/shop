package com.shop.backend.controller;

import com.shop.backend.dto.ChatMessageRequest;
import com.shop.backend.dto.ChatRoomRequest;
import com.shop.backend.entity.ChatMessage;
import com.shop.backend.response.ChatMessageResponse;
import com.shop.backend.response.ChatRoomDetailResponse;
import com.shop.backend.response.ChatRoomInfoResponse;
import com.shop.backend.response.ChatRoomResponse;
import com.shop.backend.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Chat", description = "채팅 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/chat") // 클래스 레벨에서 공통 경로 설정
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate; // WebSocket 메시지 브로커로 메시지를 보내는 데 사용

    // --- REST API ---

    @Operation(summary = "채팅방 생성 또는 조회", description = "상품 ID를 기반으로 구매자와 판매자 간의 채팅방을 생성하거나 기존 채팅방을 조회합니다. (인증 필요)")
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomResponse> createOrGetRoom(@RequestBody ChatRoomRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Long roomId = chatService.findOrCreateRoom(request.getProductId(), userDetails.getUsername());
        return ResponseEntity.ok(new ChatRoomResponse(roomId));
    }

    @Operation(summary = "채팅방 메시지 내역 조회", description = "특정 채팅방의 이전 대화 내역을 모두 조회합니다. (인증 필요)")
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getRoomMessages(@PathVariable Long roomId) {
        List<ChatMessageResponse> messages = chatService.getMessages(roomId);
        return ResponseEntity.ok(messages);
    }


    @Operation(summary = "내 채팅방 목록 조회", description = "현재 로그인한 사용자가 참여(구매자 또는 판매자)하고 있는 모든 채팅방 목록을 조회합니다. (인증 필요)")
    @GetMapping("/my-rooms")
    public ResponseEntity<List<ChatRoomInfoResponse>> getMyRooms(Principal principal) {
        List<ChatRoomInfoResponse> myRooms = chatService.getMyChatRooms(principal.getName());
        return ResponseEntity.ok(myRooms);
    }

    @Operation(summary = "특정 채팅방 상세 정보 조회", description = "채팅방 ID로 특정 채팅방의 상세 정보(예: 상품 정보)를 조회합니다. (인증 필요)")
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDetailResponse> getRoomDetails(@PathVariable Long roomId) {
        ChatRoomDetailResponse roomDetails = chatService.getChatRoomDetails(roomId);
        return ResponseEntity.ok(roomDetails);
    }


    //---- WebSocket 메시지 처리 ----

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
}