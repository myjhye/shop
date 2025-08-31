package com.shop.backend.controller;

import com.shop.backend.dto.OrderRequest;
import com.shop.backend.entity.Order;
import com.shop.backend.entity.User;
import com.shop.backend.response.OrderResponse;
import com.shop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
            return ResponseEntity.badRequest().body(e.getMessage()); // 재고 부족 예외 처리
        } catch (ObjectOptimisticLockingFailureException e) {
            // 동시성 문제(충돌) 예외 처리 블록 추가
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // 409 Conflict 상태 코드 반환
                    .body("다른 사용자의 주문과 충돌이 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}