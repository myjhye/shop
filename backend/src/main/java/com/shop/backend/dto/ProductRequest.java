package com.shop.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class ProductRequest {
    private String name;
    private int price;
    private String description;
    private int stock;
    private String category;
    private LocalDateTime createdAt;
}
