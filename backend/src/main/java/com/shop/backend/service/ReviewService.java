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
import com.shop.backend.response.NotificationResponse;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

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

        User reviewWriter = user;
        User productOwner = product.getCreatedBy();

        // 본인 상품에 리뷰를 다는 경우를 제외하는 조건 확인
        if (!productOwner.getId().equals(reviewWriter.getId())) {
            log.info("✅ 조건 통과: 상품 소유자와 리뷰 작성자가 다릅니다. 알림 전송을 시도합니다.");
            try {
                String productOwnerUsername = productOwner.getUsername();

                NotificationResponse notification = new NotificationResponse(
                        "'" + product.getName() + "' 상품에 새로운 리뷰가 달렸습니다!",
                        product.getId(),
                        product.getName(),
                        savedReview.getContent(),
                        savedReview.getCreatedAt()
                );

                // 'hong'이라는 사용자를 찾는 대신, '/topic/notifications/hong' 이라는 주소로 직접 메시지를 보냅니다.
                messagingTemplate.convertAndSend(
                        "/topic/notifications/" + productOwnerUsername,
                        notification
                );
                log.info("✅✅✅ `/topic/notifications/{}` 주소로 메시지 전송 성공! 수신자: '{}'", productOwnerUsername, productOwnerUsername);

            } catch (Exception e) {
                log.error("❌❌❌ 알림 전송 중 심각한 예외 발생: ", e);
            }
        } else {
            log.warn("🟡 조건 실패: 상품 소유자와 리뷰 작성자가 동일하여 알림을 보내지 않습니다.");
        }

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

    // 현재 로그인된 사용자가 작성한 리뷰 내역을 페이징하여 조회
    @Transactional(readOnly = true)
    public Page<ReviewResponse> findMyReviews(User user, Pageable pageable) {
        // 1. 리포지토리로부터 Page<Review> 엔티티를 조회한다
        Page<Review> reviewPage = reviewRepository.findByUser(user, pageable);

        // 2. 각 리뷰에 대해 구매자 여부를 확인하고 DTO로 변환한다 (내가 쓴 리뷰는 내가 구매한 상품에 대한 것이므로, hasPurchased는 항상 true가 된다)
        return reviewPage.map(review -> new ReviewResponse(review, true));
    }


}