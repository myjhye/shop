package com.shop.backend.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    private Long id;
    private String username;
    private String email;
}
