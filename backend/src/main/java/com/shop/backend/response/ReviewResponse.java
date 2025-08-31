package com.shop.backend.response;

import com.shop.backend.entity.Review;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class ReviewResponse {
    private Long reviewId;
    private String username;
    private String content;
    private int rating;
    private LocalDateTime createdAt;
    private String productThumbnailUrl;
    private boolean purchased;

    public ReviewResponse(Review review, boolean purchased) {
        this.reviewId = review.getId();
        this.username = review.getUser().getUsername();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.createdAt = review.getCreatedAt();
        this.productThumbnailUrl = review.getProduct().getThumbnail();
        this.purchased = purchased;
    }
}