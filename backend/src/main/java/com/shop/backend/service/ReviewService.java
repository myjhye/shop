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

    // 리뷰 수정
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, User user) {
        // 1. 수정할 리뷰를 DB에서 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));

        // 2. 권한 검사: 리뷰 작성자와 현재 로그인한 사용자가 같은지 확인
        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("리뷰를 수정할 권한이 없습니다.");
        }

        // 3. 내용 및 별점 업데이트
        review.setContent(request.getContent());
        review.setRating(request.getRating());

        // @Transactional에 의해 메소드 종료 시 자동 flush (DB에 변경사항 반영)
        // DTO로 변환하여 반환, 구매자 여부는 항상 true (작성자=구매자)
        return new ReviewResponse(review, true);
    }

    // 리뷰 삭제
    public void deleteReview(Long reviewId, User user) {
        // 1. 삭제할 리뷰를 DB에서 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));

        // 2. 권한 검사
        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("리뷰를 삭제할 권한이 없습니다.");
        }

        // 3. 리뷰 삭제
        reviewRepository.delete(review);
    }


}