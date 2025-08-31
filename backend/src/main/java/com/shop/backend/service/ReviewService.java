package com.shop.backend.service;

import com.shop.backend.dto.ReviewRequest;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.Review;
import com.shop.backend.entity.User;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.OrderRepository;
import com.shop.backend.repository.ProductRepository;
import com.shop.backend.repository.ReviewRepository;

import com.shop.backend.response.ReviewResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    // 리뷰 생성
    public ReviewResponse createReview(Long productId, ReviewRequest request, User user) {
        Product product = productRepository.findById(productId).orElseThrow();

        // --- 핵심 비즈니스 로직: 구매 이력 확인 ---
        boolean hasPurchased = orderRepository.existsByUserAndProductInOrders(user, product);
        if (!hasPurchased) {
            throw new AccessDeniedException("이 상품을 구매한 사용자만 리뷰를 작성할 수 있습니다.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setContent(request.getContent());
        review.setRating(request.getRating());

        Review savedReview = reviewRepository.save(review);
        return new ReviewResponse(savedReview, hasPurchased);
    }

    // 상품별 리뷰 목록 조회
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

        Page<Review> reviewPage = reviewRepository.findByProduct(product, pageable);


        // 각 Review 엔티티를 순회하며, ReviewResponse DTO로 변환한다
        return reviewPage.map(review -> {
            // 이 리뷰를 작성한 유저가 이 상품을 구매했는지 확인한다
            boolean hasPurchased = orderRepository.existsByUserAndProductInOrders(review.getUser(), review.getProduct());

            // DTO 생성자에 review 객체와 구매 여부(hasPurchased)를 함께 전달한다
            return new ReviewResponse(review, hasPurchased);
        });
    }
}