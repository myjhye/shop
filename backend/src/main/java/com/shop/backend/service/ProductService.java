package com.shop.backend.service;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.User;
import com.shop.backend.repository.ProductRepository;
import com.shop.backend.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    public ProductResponse create(ProductRequest request, MultipartFile thumbnailFile, User user) {
        // Cloudinary에 이미지 업로드
        String imageUrl = cloudinaryService.uploadFile(thumbnailFile);

        Product product = Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .stock(request.getStock())
                .category(request.getCategory())
                .thumbnail(imageUrl) // Cloudinary URL 저장
                .createdBy(user)
                .build();

        Product saved = productRepository.save(product);

        return new ProductResponse(
                saved.getId(),
                saved.getName(),
                saved.getPrice(),
                saved.getDescription(),
                saved.getStock(),
                saved.getThumbnail(),
                saved.getCategory()
        );
    }
}