package com.shop.backend.entity;

import com.shop.backend.dto.ProductRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private int stock; // 재고 수량

    @Column(length = 500)
    private String thumbnail;

    @Column(nullable = false, length = 50)
    private String category;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // 다대일(N:1) 관계. 여러 상품(N)은 한 명의 사용자(1)에 의해 생성될 수 있다
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    // 일대다(1:N) 관계. 하나의 상품(1)은 여러 리뷰(N)가 등록될 수 있다
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    // 낙관적 락(Optimistic Lock)을 위한 버전 필드
    @Version
    private Integer version;

    // 상품 등록
    public static Product createProduct(ProductRequest request, String imageUrl, User user) {
        return Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .stock(request.getStock())
                .category(request.getCategory())
                .thumbnail(imageUrl)
                .createdBy(user)
                .build();
    }

    // 상품 수정
    public void update(ProductRequest request, String newImageUrl) {
        this.name = request.getName();
        this.price = request.getPrice();
        this.description = request.getDescription();
        this.stock = request.getStock();
        this.category = request.getCategory();

        if (newImageUrl != null) { // 새 이미지 URL이 있을 경우에만 변경
            this.thumbnail = newImageUrl;
        }
    }

    // 해당 상품의 소유자인지 확인
    public boolean isOwnedBy(User user) {
        return this.createdBy.getId().equals(user.getId());
    }

    // 주문 시 재고 수량 감소
    public void removeStock(int quantity) {
        int restStock = this.stock - quantity;
        if (restStock < 0) {
            throw new IllegalStateException("재고가 부족합니다.");
        }
        this.stock = restStock;
    }

}
