package com.shop.backend.response;

import com.shop.backend.entity.OrderItem;
import lombok.Getter;

@Getter
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private int orderPrice;
    private String thumbnailUrl;

    public OrderItemResponse(OrderItem orderItem) {
        this.productId = orderItem.getProduct().getId();
        this.productName = orderItem.getProduct().getName();
        this.quantity = orderItem.getQuantity();
        this.orderPrice = orderItem.getOrderPrice();
        this.thumbnailUrl = orderItem.getProduct().getThumbnail();
    }
}