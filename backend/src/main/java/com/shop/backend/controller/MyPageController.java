package com.shop.backend.controller;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.OrderResponse;
import com.shop.backend.response.ProductResponse;
import com.shop.backend.response.ReviewResponse;
import com.shop.backend.service.OrderService;
import com.shop.backend.service.ProductService;
import com.shop.backend.service.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "MyPage", description = "마이페이지 관련 API (인증 필요)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class MyPageController {

    private final ProductService productService;
    private final OrderService orderService;
    private final ReviewService reviewService;

    // 내가 등록한 상품 목록 조회
    @Operation(summary = "내가 등록한 상품 목록 조회", description = "현재 로그인된 사용자가 등록한 상품 목록을 페이징하여 조회합니다.")
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getMyProducts(
        @Parameter(hidden = true) @AuthenticationPrincipal User user,
        @ParameterObject Pageable pageable
    ) {
        Page<ProductResponse> myProducts = productService.findMyProducts(user, pageable);
        return ResponseEntity.ok(myProducts);
    }

    // 내가 등록한 상품 수정
    @Operation(summary = "내가 등록한 상품 수정", description = "자신이 등록한 상품의 정보를 수정합니다.")
    @PutMapping(value = "/products/{productId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ProductResponse> updateProduct(
        @Parameter(description = "수정할 상품 ID") @PathVariable Long productId,
        @Parameter(description = "상품 정보 JSON 문자열") @RequestParam("data") String dataJson,
        @Parameter(description = "새로운 상품 썸네일 이미지 (선택 사항)") @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
        @Parameter(hidden = true) @AuthenticationPrincipal User user) throws Exception
    {
        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequest request = objectMapper.readValue(dataJson, ProductRequest.class);

        ProductResponse updatedProduct = productService.update(productId, request, thumbnailFile, user);
        return ResponseEntity.ok(updatedProduct);
    }

    // 내가 등록한 상품 삭제
    @Operation(summary = "내가 등록한 상품 삭제", description = "자신이 등록한 상품을 삭제합니다.")
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
        @Parameter(description = "삭제할 상품 ID") @PathVariable Long productId,
        @Parameter(hidden = true) @AuthenticationPrincipal User user
    ) {
        productService.delete(productId, user);
        return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답
    }

    // 내가 구매한 상품 조회
    @Operation(summary = "내 주문 내역 조회", description = "현재 로그인된 사용자의 주문 내역을 최신순으로 페이징하여 조회합니다.")
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
        @Parameter(hidden = true) @AuthenticationPrincipal User user,
        @Parameter(hidden = true) @PageableDefault(size = 5, sort = "orderDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<OrderResponse> myOrders = orderService.findMyOrders(user, pageable);
        return ResponseEntity.ok(myOrders);
    }

    // 내가 작성한 리뷰 조회
    @Operation(summary = "내가 작성한 리뷰 조회", description = "현재 로그인된 사용자가 작성한 리뷰를 최신순으로 페이징하여 조회합니다.")
    @GetMapping("/reviews")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
        @AuthenticationPrincipal User user,
        @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ReviewResponse> myReviews = reviewService.findMyReviews(user, pageable);
        return ResponseEntity.ok(myReviews);
    }
}
