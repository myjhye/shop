package com.shop.backend.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class OrderRequest {
    private List<OrderItemRequest> orderItems;
}