package com.shop.backend.repository;

import com.shop.backend.entity.Cart;
import com.shop.backend.entity.CartItem;
import com.shop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // 특정 장바구니에 특정 상품이 이미 담겨 있는지 확인
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
