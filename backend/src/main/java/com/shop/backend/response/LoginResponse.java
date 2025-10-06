package com.shop.backend.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private final Long id;
    private String token;      // Access Token
    private String username;
    private String email;
}
