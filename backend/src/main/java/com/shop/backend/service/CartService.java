package com.shop.backend.service;

import com.shop.backend.dto.CartItemRequest;
import com.shop.backend.entity.*;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.*;
import com.shop.backend.response.CartItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    // 장바구니에 상품 추가
    public void addOrUpdateItem(User user, CartItemRequest request) {
        // 1. 사용자의 장바구니 조회
        Cart cart = cartRepository.findByUser(user).orElse(null);

        // 2. 장바구니가 없다면 새로 생성하고 아니면 저장
        if (cart == null) {
            cart = Cart.createCart(user);
            cartRepository.save(cart);
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

        // 3. 이제 cart 객체는 DB에 저장된 상태이므로, 아래 로직이 정상 동작
        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem == null) { // 장바구니에 해당 상품이 없으면 새로 추가
            cartItem = CartItem.createCartItem(cart, product, request.getQuantity());
        }
        else { // 이미 있으면 수량만 더함
            cartItem.addQuantity(request.getQuantity());
        }
        cartItemRepository.save(cartItem);
    }

    // 내 장바구니 조회
    public List<CartItemResponse> getCartItems(User user) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("장바구니를 찾을 수 없습니다."));

        return cart.getCartItems().stream()
                .map(CartItemResponse::new)
                .collect(Collectors.toList());
    }

    // 장바구니 상품 수량 수정
    public void updateItemQuantity(User user, Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("장바구니 상품을 찾을 수 없습니다."));

        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        cartItem.setQuantity(quantity);
    }

    // 장바구니 상품 삭제
    public void deleteItem(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("장바구니 상품을 찾을 수 없습니다."));

        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        cartItemRepository.delete(cartItem);
    }
}