package com.shop.backend.response;

import com.shop.backend.entity.ChatRoom;
import lombok.Getter;

@Getter
public class ChatRoomDetailResponse {
    private final Long roomId;
    private final String productName;
    private final String productThumbnail;

    public ChatRoomDetailResponse(ChatRoom chatRoom) {
        this.roomId = chatRoom.getId();
        this.productName = chatRoom.getProduct().getName();
        this.productThumbnail = chatRoom.getProduct().getThumbnail();
    }
}