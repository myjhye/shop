package com.shop.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username; // 로그인 아이디

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String role = "USER"; // USER / ADMIN
}
