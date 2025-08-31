package com.shop.backend.dto;

import lombok.Getter;

@Getter
public class ReviewRequest {
    private String content;
    private int rating;
}
