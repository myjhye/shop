package com.shop.backend.response;

import com.shop.backend.entity.OrderItem;
import lombok.Getter;

@Getter
public class OrderItemResponse {
    private String productName;
    private int quantity;
    private int orderPrice;
    private String thumbnailUrl;

    public OrderItemResponse(OrderItem orderItem) {
        this.productName = orderItem.getProduct().getName();
        this.quantity = orderItem.getQuantity();
        this.orderPrice = orderItem.getOrderPrice();
        this.thumbnailUrl = orderItem.getProduct().getThumbnail();
    }
}