package com.shop.backend.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {
    private String message;
    private Long productId;
    private String productName;
    private String content;
    private LocalDateTime createdAt;
}