package com.shop.backend.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private int price;
    private String description;
    private int stock;
    private String thumbnail;
    private String category;
    private LocalDateTime createdAt;
}
