package com.shop.backend.controller;

import com.shop.backend.dto.OrderRequest;
import com.shop.backend.entity.Order;
import com.shop.backend.entity.User;
import com.shop.backend.response.OrderResponse;
import com.shop.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Order", description = "주문 관련 API (인증 필요)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // --- 주문 생성 ---
    @Operation(summary = "주문 생성", description = "장바구니 또는 상품 상세 페이지에서 상품을 주문합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "주문 성공"),
        @ApiResponse(responseCode = "400", description = "재고 부족"),
        @ApiResponse(responseCode = "409", description = "주문 충돌 발생 (동시성 문제)")
    })
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest orderRequest,
            @Parameter(hidden = true) @AuthenticationPrincipal User user
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

    // --- 구매 이력 확인 ---
    @Operation(summary = "상품 구매 이력 확인", description = "현재 로그인된 사용자가 특정 상품을 구매했는지 여부를 확인합니다.")
    @GetMapping("/check-purchase")
    public ResponseEntity<Map<String, Boolean>> checkPurchase(
        @Parameter(description = "확인할 상품 ID") @RequestParam Long productId,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        boolean hasPurchased = orderService.hasPurchaseHistory(user, productId);
        return ResponseEntity.ok(Map.of("hasPurchased", hasPurchased));
    }
}