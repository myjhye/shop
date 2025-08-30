package com.shop.backend.entity;

import com.shop.backend.dto.SignupRequest;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    // 일대다(1:N) 관계. 한 명의 사용자(1)는 여러 상품(N)을 등록할 수 있다
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products = new ArrayList<>();

    // 일대일(1:1) 관계. 한 명의 사용자(1)는 하나의 장바구니(1)를 가진다
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    // 회원가입
    public static User createUser(SignupRequest request, BCryptPasswordEncoder passwordEncoder) {
        return User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // 생성 시 암호화
                .email(request.getEmail())
                .role("USER")
                .build();
    }

    // 입력된 비밀번호가 저장된 비밀번호와 일치하는지 확인
    public boolean matchesPassword(String rawPassword, BCryptPasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(rawPassword, this.password);
    }



    // --- Spring Security UserDetails 인터페이스 구현부 ---
    // 아래 메소드들은 Spring Security가 사용자의 인증 및 권한 정보를 관리하는 데 필요
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}