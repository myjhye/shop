package com.shop.backend.controller;

import com.shop.backend.dto.CartItemRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.CartItemResponse;
import com.shop.backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Cart", description = "장바구니 관련 API (인증 필요)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    // 내 장바구니 조회
    @Operation(summary = "내 장바구니 조회", description = "현재 로그인된 사용자의 장바구니에 담긴 모든 상품을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(@Parameter(hidden = true) @AuthenticationPrincipal User user) {
        List<CartItemResponse> cartItems = cartService.getCartItems(user);
        return ResponseEntity.ok(cartItems);
    }

    // 장바구니에 상품 추가
    @Operation(summary = "장바구니에 상품 추가", description = "장바구니에 상품을 추가합니다. 이미 있는 상품이면 수량이 더해집니다.")
    @PostMapping("/items")
    public ResponseEntity<Void> addCartItem(@RequestBody CartItemRequest request, @Parameter(hidden = true) @AuthenticationPrincipal User user) {
        cartService.addOrUpdateItem(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 장바구니 상품 수량 수정
    @Operation(summary = "장바구니 상품 수량 수정", description = "장바구니에 담긴 특정 상품의 수량을 변경합니다.")
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<Void> updateCartItem(
        @Parameter(description = "장바구니 상품 ID") @PathVariable Long cartItemId,
        @RequestBody Map<String, Integer> payload,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        cartService.updateItemQuantity(user, cartItemId, payload.get("quantity"));
        return ResponseEntity.ok().build();
    }

    // 장바구니 상품 삭제
    @Operation(summary = "장바구니 상품 삭제", description = "장바구니에서 특정 상품을 제거합니다.")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(
        @Parameter(description = "장바구니 상품 ID") @PathVariable Long cartItemId,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        cartService.deleteItem(user, cartItemId);
        return ResponseEntity.noContent().build();
    }
}