package com.shop.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    // ⭐️ 주입받은 userDetailsService를 사용합니다.
    private final UserDetailsService userDetailsService;

    @Value("${app.jwt-secret}")
    private String jwtSecretString;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecretString.getBytes());
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            // 실제 운영 환경에서는 로깅을 사용하는 것이 좋습니다.
            // e.printStackTrace();
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // e.printStackTrace();
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        // ⭐️ 오류가 발생했던 customUserDetailsService를 userDetailsService로 수정했습니다.
        // ⭐️ 또한, 존재하지 않던 getUsername() 메소드 호출을 getUsernameFromToken()으로 수정했습니다.
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUsernameFromToken(token));

        // userDetails 객체 자체를 principal로 전달하여 Principal의 이름이 username이 되도록 합니다.
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }
}