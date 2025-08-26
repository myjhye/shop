package com.shop.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS512); // JWT 비밀 키 (토큰 서명 및 검증에 사용)

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationMs; // 토큰 만료 시간 (밀리초 단위)

    // JWT 토큰 생성
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs); // 만료 시간 계산

        return Jwts.builder()
                .setSubject(username) // 토큰의 subject(사용자 식별자) 설정
                .setIssuedAt(now) // 토큰 발급 시간
                .setExpiration(expiry) // 토큰 만료 시간
                .signWith(jwtSecret, SignatureAlgorithm.HS512) // 비밀키와 알고리즘으로 서명
                .compact(); // 최종적으로 토큰 문자열 생성
    }

    // 토큰에서 사용자 정보 추출 (로그인 후 API 요청 시 토큰 안의 username 꺼내기)
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 토큰 유효성 검사 (만료되었거나 변조된 토큰을 걸러내기)
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }
}
