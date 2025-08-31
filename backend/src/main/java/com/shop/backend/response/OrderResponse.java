package com.shop.backend.response;

import com.shop.backend.entity.Order;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class OrderResponse {
    private Long orderId;
    private LocalDateTime orderDate;
    private List<OrderItemResponse> orderItems;
    private int totalPrice;

    public OrderResponse(Order order) {
        this.orderId = order.getId();
        this.orderDate = order.getOrderDate();
        this.orderItems = order.getOrderItems().stream()
                .map(OrderItemResponse::new)
                .collect(Collectors.toList());
        this.totalPrice = order.getOrderItems().stream()
                .mapToInt(item -> item.getOrderPrice() * item.getQuantity())
                .sum();
    }
}