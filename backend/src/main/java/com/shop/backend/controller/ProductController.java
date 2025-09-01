package com.shop.backend.controller;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.ProductResponse;
import com.shop.backend.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Product", description = "상품 관련 공용 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    // 상품 등록
    @Operation(summary = "상품 등록", description = "새로운 상품을 등록합니다. (인증 필요)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
        @Parameter(description = "상품 정보 JSON 문자열") @RequestParam("data") String dataJson,
        @Parameter(description = "상품 썸네일 이미지 파일") @RequestParam("thumbnail") MultipartFile thumbnailFile,
        @Parameter(hidden = true) @AuthenticationPrincipal User user) throws Exception
    {
        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequest request = objectMapper.readValue(dataJson, ProductRequest.class);

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        ProductResponse response = productService.create(request, thumbnailFile, user);
        return ResponseEntity.ok(response);
    }

    // 상품 전체 조회
    @Operation(summary = "상품 목록 조회 (검색/필터링/정렬/페이징)", description = "다양한 조건으로 상품 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
        @Parameter(description = "카테고리 필터") @RequestParam(required = false) String category,
        @Parameter(description = "최소 가격 필터") @RequestParam(required = false) Integer minPrice,
        @Parameter(description = "최대 가격 필터") @RequestParam(required = false) Integer maxPrice,
        @ParameterObject Pageable pageable
    ) {
        Page<ProductResponse> products = productService.findAll(category, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    // 상품 상세 조회
    @Operation(summary = "상품 상세 조회", description = "ID로 특정 상품의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@Parameter(description = "상품 ID") @PathVariable Long id) {
        ProductResponse product = productService.findById(id);
        return ResponseEntity.ok(product);
    }


}