package com.shop.backend.service;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.User;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.ProductRepository;
import com.shop.backend.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    // 상품 등록
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

    // 상품 전체 조회
    public Page<ProductResponse> findAll(String category, Integer minPrice, Integer maxPrice, Pageable pageable) {
        // category가 'all'이면 null로 취급하여 전체 카테고리를 검색하도록 함
        String filterCategory = (category != null && category.equals("all")) ? null : category;

        Page<Product> productPage = productRepository.findWithFilters(filterCategory, minPrice, maxPrice, pageable);

        return productPage.map(product -> new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getStock(),
                product.getThumbnail(),
                product.getCategory()
        ));
    }


    // 상품 상세 조회
    public ProductResponse findById(Long id) {
        // 1. id를 이용하여 Product 엔티티를 조회합니다.
        Product product = productRepository.findById(id)
                // 2. 만약 해당 id의 상품이 없다면 예외를 발생시킵니다.
                .orElseThrow(() -> new ResourceNotFoundException("해당 상품을 찾을 수 없습니다. id=" + id));

        // 3. 조회된 엔티티를 DTO로 변환하여 반환합니다.
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getStock(),
                product.getThumbnail(),
                product.getCategory()
        );
    }
}