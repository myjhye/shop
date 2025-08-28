package com.shop.backend.controller;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.User;
import com.shop.backend.response.ProductResponse;
import com.shop.backend.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    // 상품 등록
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestParam("data") String dataJson,
            @RequestParam("thumbnail") MultipartFile thumbnailFile,
            @AuthenticationPrincipal User user
    ) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequest request = objectMapper.readValue(dataJson, ProductRequest.class);

        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        ProductResponse response = productService.create(request, thumbnailFile, user);
        return ResponseEntity.ok(response);
    }

    // 상품 전체 조회
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.findAll();
        return ResponseEntity.ok(products);
    }

    // 상품 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.findById(id);
        return ResponseEntity.ok(product);
    }
}