package com.shop.backend.repository;

import com.shop.backend.entity.Order;
import com.shop.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // 특정 사용자의 주문 목록을 페이징하여 조회
    Page<Order> findByUser(User user, Pageable pageable);
}