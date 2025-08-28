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

    public ProductResponse create(ProductRequest request, MultipartFile thumbnailFile, User user) {
        // 절대 경로 대신 프로젝트 루트 기준으로 설정
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;

        // 디렉터리가 없으면 생성
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs();
            if (!created) {
                throw new RuntimeException("업로드 디렉터리 생성 실패: " + uploadDir);
            }
        }

        String filename = UUID.randomUUID() + "_" + thumbnailFile.getOriginalFilename();
        File dest = new File(uploadDir + filename);

        try {
            thumbnailFile.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패: " + e.getMessage(), e);
        }

        Product product = Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .stock(request.getStock())
                .category(request.getCategory())
                .thumbnail(filename)
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
