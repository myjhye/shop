package com.shop.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter @Setter
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cart와의 N:1 관계. 어느 장바구니에 속해 있는지.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    // Product와의 N:1 관계. 어떤 상품이 담겼는지.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private int quantity; // 담긴 수량

    @CreationTimestamp
    private LocalDateTime createdAt;

    // CartItem을 생성하는 정적 메소드
    public static CartItem createCartItem(Cart cart, Product product, int quantity) {
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(quantity);
        return cartItem;
    }

    // 이미 담긴 상품의 수량을 추가하는 메소드
    public void addQuantity(int quantity) {
        this.quantity += quantity;
    }
}