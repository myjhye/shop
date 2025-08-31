package com.shop.backend.repository;

import com.shop.backend.entity.Order;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // 특정 사용자의 주문 목록을 페이징하여 조회
    Page<Order> findByUser(User user, Pageable pageable);

    // 특정 사용자가 특정 상품을 주문한 이력이 있는지 확인
    @Query(
            "SELECT COUNT(o) > 0 " +
                    "FROM Order o " +
                    "JOIN o.orderItems oi " +
                    "WHERE o.user = :user " +
                    "AND oi.product = :product"
    )
    boolean existsByUserAndProductInOrders(@Param("user") User user, @Param("product") Product product);
}