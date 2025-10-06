package com.shop.backend.service;

import com.shop.backend.dto.ChatMessageRequest;
import com.shop.backend.entity.*;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.ChatMessageRepository;
import com.shop.backend.repository.ChatRoomRepository;
import com.shop.backend.repository.ProductRepository;
import com.shop.backend.repository.UserRepository;
import com.shop.backend.response.ChatMessageResponse;
import com.shop.backend.response.ChatRoomDetailResponse;
import com.shop.backend.response.ChatRoomInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long findOrCreateRoom(Long productId, String buyerUsername) {
        // userRepository.findByEmail -> findByUsername으로 변경
        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + buyerUsername));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getCreatedBy().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot chat about your own product.");
        }

        return chatRoomRepository.findByProductAndBuyer(product, buyer)
                .map(ChatRoom::getId)
                .orElseGet(() -> {
                    ChatRoom newChatRoom = ChatRoom.builder()
                            .product(product)
                            .buyer(buyer)
                            .build();
                    return chatRoomRepository.save(newChatRoom).getId();
                });
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessageRequest request, String senderUsername) {
        // userRepository.findByEmail -> findByUsername으로 변경
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + senderUsername));

        ChatRoom chatRoom = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatRoom not found"));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(request.getMessage())
                .build();

        return chatMessageRepository.save(chatMessage);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId)
                .stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomInfoResponse> getMyChatRooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return chatRoomRepository.findAllByUser(user)
                .stream()
                .map(chatRoom -> new ChatRoomInfoResponse(chatRoom, username))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatRoomDetailResponse getChatRoomDetails(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatRoom not found"));
        return new ChatRoomDetailResponse(chatRoom);
    }
}