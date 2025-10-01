package com.shop.backend.service;

import com.shop.backend.dto.ProductRequest;
import com.shop.backend.entity.Product;
import com.shop.backend.entity.User;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.ProductRepository;
import com.shop.backend.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    // 상품 등록
    public ProductResponse create(ProductRequest request, MultipartFile thumbnailFile, User user) {

        String imageUrl = cloudinaryService.uploadFile(thumbnailFile); // Cloudinary에 이미지 업로드

        // Product.createProduct(...)를 사용하는 대신 직접 객체를 생성하고 값을 설정합니다.
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setThumbnail(imageUrl);
        product.setCreatedBy(user); // ⭐️⭐️⭐️ 이 한 줄이 모든 문제의 최종 해결책입니다.

        Product saved = productRepository.save(product);

        return new ProductResponse(
                saved.getId(),
                saved.getName(),
                saved.getPrice(),
                saved.getDescription(),
                saved.getStock(),
                saved.getThumbnail(),
                saved.getCategory(),
                saved.getCreatedAt()
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
                product.getCategory(),
                product.getCreatedAt()
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
                product.getCategory(),
                product.getCreatedAt()
        );
    }

    // 내가 올린 상품 목록 조회
    public Page<ProductResponse> findMyProducts(User user, Pageable pageable) {
        Page<Product> productPage = productRepository.findByCreatedBy(user, pageable);
        return productPage.map(product -> new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getStock(),
                product.getThumbnail(),
                product.getCategory(),
                product.getCreatedAt()
        ));
    }

    // 내가 올린 상품 목록 수정
    public ProductResponse update(Long productId, ProductRequest request, MultipartFile thumbnailFile, User user) {
        // 1. ID를 기반으로 DB에서 상품을 조회합니다. 없으면 예외 발생.
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 상품을 찾을 수 없습니다. id=" + productId));

        // 2. 권한 검사: 상품을 등록한 사용자와 현재 로그인한 사용자가 같은지 확인합니다.
        if (!product.isOwnedBy(user)) {
            throw new AccessDeniedException("상품을 수정할 권한이 없습니다.");
        }

        // 3. 썸네일 파일이 새로 첨부된 경우에만 Cloudinary에 업로드하고 URL을 교체합니다.
        String newImageUrl = null;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            newImageUrl = cloudinaryService.uploadFile(thumbnailFile);
        }

        // 4. DTO에 담겨온 정보로 상품 엔티티의 내용을 업데이트합니다.
        product.update(request, newImageUrl);

        // 5. 수정된 상품 정보를 DB에 저장(flush)하고, DTO로 변환하여 반환합니다.
        Product updatedProduct = productRepository.save(product);

        return new ProductResponse(
                updatedProduct.getId(),
                updatedProduct.getName(),
                updatedProduct.getPrice(),
                updatedProduct.getDescription(),
                updatedProduct.getStock(),
                updatedProduct.getThumbnail(),
                updatedProduct.getCategory(),
                updatedProduct.getCreatedAt()
        );
    }

    // 내가 올린 상품 목록 삭제
    public void delete(Long productId, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 상품을 찾을 수 없습니다. id=" + productId));

        // 권한 검사
        if (!product.isOwnedBy(user)) {
            throw new AccessDeniedException("상품을 삭제할 권한이 없습니다.");
        }

        productRepository.delete(product);
    }
}