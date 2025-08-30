package com.shop.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CartItemRequest {
    private Long productId;
    private int quantity;
}