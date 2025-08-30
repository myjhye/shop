package com.shop.backend.response;

import com.shop.backend.entity.CartItem;
import lombok.Getter;

@Getter
public class CartItemResponse {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private int price;
    private int quantity;
    private String thumbnailUrl;

    public CartItemResponse(CartItem cartItem) {
        this.cartItemId = cartItem.getId();
        this.productId = cartItem.getProduct().getId();
        this.productName = cartItem.getProduct().getName();
        this.price = cartItem.getProduct().getPrice();
        this.quantity = cartItem.getQuantity();
        this.thumbnailUrl = cartItem.getProduct().getThumbnail();
    }
}