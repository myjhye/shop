package com.shop.backend.repository;

import com.shop.backend.entity.Product;
import com.shop.backend.entity.Review;
import com.shop.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProduct(Product product, Pageable pageable);

    // 특정 사용자가 작성한 리뷰 목록을 페이징하여 조회
    Page<Review> findByUser(User user, Pageable pageable);
}