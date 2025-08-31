package com.shop.backend.dto;

import lombok.Getter;

@Getter
public class OrderItemRequest {
    private Long productId;
    private int quantity;
}