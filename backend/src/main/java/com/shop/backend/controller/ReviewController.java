package com.shop.backend.controller;

import com.shop.backend.dto.ReviewRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.ReviewResponse;
import com.shop.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@Tag(name = "Review", description = "상품 리뷰 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/products/{productId}/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    // 특정 상품의 리뷰 목록 조회
    @Operation(summary = "상품별 리뷰 목록 조회", description = "특정 상품에 달린 리뷰 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getReviews(
        @Parameter(description = "상품 ID") @PathVariable Long productId,
        @PageableDefault(size = 3, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, pageable));
    }

    // 특정 상품에 리뷰 작성
    @Operation(summary = "리뷰 작성", description = "특정 상품에 대해 리뷰를 작성합니다. (구매자만 가능, 인증 필요)")
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
        @Parameter(description = "상품 ID") @PathVariable Long productId,
        @RequestBody ReviewRequest request,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        ReviewResponse reviewResponse = reviewService.createReview(productId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewResponse);
    }

    // 특정 상품의 특정 리뷰 수정
    @Operation(summary = "리뷰 수정", description = "자신이 작성한 리뷰를 수정합니다. (작성자 본인만 가능, 인증 필요)")
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
        @Parameter(description = "상품 ID (경로상 필요)") @PathVariable Long productId,
        @Parameter(description = "수정할 리뷰 ID") @PathVariable Long reviewId,
        @RequestBody ReviewRequest request,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        ReviewResponse updatedReview = reviewService.updateReview(reviewId, request, user);
        return ResponseEntity.ok(updatedReview);
    }

    // 특정 상품의 특정 리뷰 삭제
    @Operation(summary = "리뷰 삭제", description = "자신이 작성한 리뷰를 삭제합니다. (작성자 본인만 가능, 인증 필요)")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
        @Parameter(description = "상품 ID (경로상 필요)") @PathVariable Long productId,
        @Parameter(description = "삭제할 리뷰 ID") @PathVariable Long reviewId,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.noContent().build();
    }
}