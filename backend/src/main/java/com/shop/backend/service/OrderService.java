package com.shop.backend.service;

import com.shop.backend.dto.OrderItemRequest;
import com.shop.backend.dto.OrderRequest;
import com.shop.backend.entity.*;
import com.shop.backend.exception.ResourceNotFoundException;
import com.shop.backend.repository.*;
import com.shop.backend.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository; // 장바구니 비우기를 위해 주입

    // --- 주문 생성 ---
    public Order createOrder(OrderRequest orderRequest, User user) {
        // 1. 주문 상품(OrderItem) 리스트 생성
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest itemDto : orderRequest.getOrderItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

            // OrderItem 생성 (이때 Product의 재고 감소 로직이 호출됨)
            orderItems.add(OrderItem.createOrderItem(product, itemDto.getQuantity()));
        }

        // 2. 주문(Order) 생성
        Order order = Order.createOrder(user, orderItems);

        // 3. 주문 저장 (Cascade 설정으로 OrderItem들도 함께 저장됨)
        orderRepository.save(order);

        // 4. 장바구니에서 주문된 상품들 제거
        clearCartItems(user, orderItems);

        return order;
    }

    // 장바구니에서 주문된 상품들 제거
    private void clearCartItems(User user, List<OrderItem> orderItems) {
        if (user.getCart() != null) {
            for (OrderItem orderItem : orderItems) {
                cartItemRepository.findByCartAndProduct(user.getCart(), orderItem.getProduct())
                        .ifPresent(cartItemRepository::delete);
            }
        }
    }

    // 현재 로그인된 사용자의 주문 내역을 페이징하여 조회
    public Page<OrderResponse> findMyOrders(User user, Pageable pageable) {
        // 1. 리포지토리로부터 Page<Order> 엔티티를 조회한다
        Page<Order> orderPage = orderRepository.findByUser(user, pageable);

        // 2. Page.map 기능을 사용하여 Page<Order>를 Page<OrderResponse>로 변환한다
        return orderPage.map(OrderResponse::new);
    }

    // --- 구매 이력 확인 ---
    @Transactional(readOnly = true)
    public boolean hasPurchaseHistory(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));
        return orderRepository.existsByUserAndProductInOrders(user, product);
    }
}