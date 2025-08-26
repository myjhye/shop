package com.shop.backend.service;

import com.shop.backend.dto.SignupRequest;
import com.shop.backend.entity.User;
import com.shop.backend.repository.UserRepository;
import com.shop.backend.response.SignupResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // 암호화
                .email(request.getEmail())
                .role("USER")
                .build();

        User savedUser = userRepository.save(user);

        // DTO 변환 후 반환
        return new SignupResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

}
