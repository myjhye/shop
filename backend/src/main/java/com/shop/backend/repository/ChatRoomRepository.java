package com.shop.backend.repository;

import com.shop.backend.entity.ChatRoom;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 상품과 구매자로 채팅방을 찾는 쿼리
    Optional<ChatRoom> findByProductAndBuyer(Product product, User buyer);

    // 사용자가 구매자이거나 판매자인 모든 채팅방을 찾는 쿼리
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.buyer = :user OR cr.product.createdBy = :user ORDER BY cr.id DESC")
    List<ChatRoom> findAllByUser(@Param("user") User user);
}