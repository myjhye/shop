package com.shop.backend.controller;

import com.shop.backend.dto.OrderRequest;
import com.shop.backend.entity.Order;
import com.shop.backend.entity.User;
import com.shop.backend.response.OrderResponse;
import com.shop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal User user
    ) {
        try {
            Order order = orderService.createOrder(orderRequest, user);
            OrderResponse orderResponse = new OrderResponse(order); // DTO로 변환
            return ResponseEntity.status(HttpStatus.CREATED).body(orderResponse);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}