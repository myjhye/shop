package com.shop.backend.controller;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.OrderResponse;
import com.shop.backend.response.ProductResponse;
import com.shop.backend.service.OrderService;
import com.shop.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {

    private final ProductService productService;
    private final OrderService orderService;

    // 내가 등록한 상품 목록 조회
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal User user,
            Pageable pageable
    ) {
        Page<ProductResponse> myProducts = productService.findMyProducts(user, pageable);
        return ResponseEntity.ok(myProducts);
    }

    // 내가 등록한 상품 수정
    @PutMapping(value = "/products/{productId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestParam("data") String dataJson,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @AuthenticationPrincipal User user) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequest request = objectMapper.readValue(dataJson, ProductRequest.class);

        ProductResponse updatedProduct = productService.update(productId, request, thumbnailFile, user);
        return ResponseEntity.ok(updatedProduct);
    }

    // 내가 등록한 상품 삭제
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user) {
        productService.delete(productId, user);
        return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답
    }

    // 내가 구매한 상품 조회
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal User user,
            // Pageable 기본값 설정: 5개씩, 주문 날짜(orderDate) 기준 내림차순(최신순) 정렬
            @PageableDefault(size = 5, sort = "orderDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<OrderResponse> myOrders = orderService.findMyOrders(user, pageable);
        return ResponseEntity.ok(myOrders);
    }
}
