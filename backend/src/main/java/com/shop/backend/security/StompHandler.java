package com.shop.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        log.info("📨 STOMP 메시지 수신 - Command: {}, Destination: {}",
                accessor.getCommand(), accessor.getDestination());

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwt = accessor.getFirstNativeHeader("Authorization");

            log.info("🔐 JWT 토큰 확인 - 존재 여부: {}", jwt != null);

            if (jwt != null && jwt.startsWith("Bearer ")) {
                String token = jwt.substring(7);

                try {
                    if (jwtProvider.validateToken(token)) {
                        Authentication auth = jwtProvider.getAuthentication(token);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        accessor.setUser(auth);

                        // ⭐️ 핵심: Principal 이름 확인
                        log.info("✅ 웹소켓 인증 성공");
                        log.info("👤 Principal 이름: {}", auth.getName());
                        log.info("🔍 Principal 클래스: {}", auth.getClass().getSimpleName());

                        // 만약 CustomUserPrincipal 같은 걸 사용한다면 추가 정보도 확인
                        if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
                            org.springframework.security.core.userdetails.User userDetails =
                                    (org.springframework.security.core.userdetails.User) auth.getPrincipal();
                            log.info("🔍 UserDetails username: {}", userDetails.getUsername());
                        }

                    } else {
                        log.warn("❌ JWT 토큰 검증 실패");
                    }
                } catch (Exception e) {
                    log.error("❌ JWT 토큰 처리 중 오류: ", e);
                }
            } else {
                log.warn("❌ Authorization 헤더가 없거나 형식이 잘못됨");
            }
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("📡 STOMP CONNECT 응답 전송 완료 - 성공: {}", sent);
        }
    }
}