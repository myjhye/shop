package com.shop.backend.response;

import com.shop.backend.entity.ChatRoom;
import lombok.Getter;

@Getter
public class ChatRoomInfoResponse {
    private final Long roomId;
    private final String partnerName;
    private final String productName;

    public ChatRoomInfoResponse(ChatRoom chatRoom, String currentUsername) {
        this.roomId = chatRoom.getId();

        // 내가 구매자면 상대는 판매자, 내가 판매자면 상대는 구매자
        if (chatRoom.getBuyer().getUsername().equals(currentUsername)) {
            this.partnerName = chatRoom.getProduct().getCreatedBy().getUsername();
        }
        else {
            this.partnerName = chatRoom.getBuyer().getUsername();
        }

        this.productName = chatRoom.getProduct().getName();
    }
}