package com.shop.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter @Setter
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private int orderPrice; // 주문 당시의 상품 가격
    private int quantity;   // 주문 수량

    // 주문 생성
    public static OrderItem createOrderItem(Product product, int quantity) {
        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setOrderPrice(product.getPrice()); // 현재 상품 가격을 주문 가격으로 설정
        orderItem.setQuantity(quantity);

        product.removeStock(quantity); // 주문 수량만큼 상품 재고 감소
        return orderItem;
    }
}