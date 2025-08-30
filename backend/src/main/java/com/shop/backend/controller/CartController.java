package com.shop.backend.controller;

import com.shop.backend.dto.CartItemRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.CartItemResponse;
import com.shop.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    // 내 장바구니 조회
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(@AuthenticationPrincipal User user) {
        List<CartItemResponse> cartItems = cartService.getCartItems(user);
        return ResponseEntity.ok(cartItems);
    }

    // 장바구니에 상품 추가
    @PostMapping("/items")
    public ResponseEntity<Void> addCartItem(@RequestBody CartItemRequest request, @AuthenticationPrincipal User user) {
        cartService.addOrUpdateItem(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 장바구니 상품 수량 수정
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> payload,
            @AuthenticationPrincipal User user) {
        cartService.updateItemQuantity(user, cartItemId, payload.get("quantity"));
        return ResponseEntity.ok().build();
    }

    // 장바구니 상품 삭제
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable Long cartItemId,
            @AuthenticationPrincipal User user) {
        cartService.deleteItem(user, cartItemId);
        return ResponseEntity.noContent().build();
    }
}