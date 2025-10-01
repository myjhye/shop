import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

export const useNotifications = (onNotificationReceived) => {
    const { user } = useAuth();
    // 클라이언트 인스턴스를 저장하기 위해 useRef 사용
    const clientRef = useRef(null);

    useEffect(() => {
        // 1. 사용자 정보가 없거나 콜백이 없으면 연결 로직을 실행하지 않음
        if (!user || !user.token || !onNotificationReceived) {
            // 만약 이전에 연결된 클라이언트가 있다면 비활성화
            if (clientRef.current) {
                console.log('🚪 로그아웃 상태이므로 WebSocket 연결을 종료합니다.');
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            return;
        }

        // 2. 이미 연결된 클라이언트가 있다면 중복 연결 방지
        if (clientRef.current) {
            console.log('🔌 WebSocket이 이미 연결되어 있습니다.');
            return;
        }

        const wsUrl = process.env.REACT_APP_WEBSOCKET_URL;
        console.log('✅ WebSocket 연결을 시도합니다...');

        // 3. STOMP 클라이언트 생성
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl), // 백엔드 주소
            connectHeaders: {
                Authorization: `Bearer ${user.token}`,
            },
            debug: (str) => {
                console.log(`STOMP DEBUG: ${str}`);
            },
            reconnectDelay: 5000,
        });

        // 4. 연결 성공 시 콜백
        client.onConnect = (frame) => {
            console.log('✅ STOMP: WebSocket에 연결되었습니다.');
            // AuthContext에서 제공하는 user 객체에 username이 포함되어 있어야 합니다.
            const personalTopic = `/topic/notifications/${user.username}`;

            client.subscribe(personalTopic, (message) => {
                try {
                    const notification = JSON.parse(message.body);
                    if (typeof onNotificationReceived === 'function') {
                        onNotificationReceived(notification);
                    }
                } catch (error) {
                    console.error('🔴 알림 메시지 파싱 중 오류 발생:', error);
                }
            });
            console.log(`👂 STOMP 구독 시작: ${personalTopic}`);
        };

        // 5. 에러 콜백
        client.onStompError = (frame) => {
            console.error('🔴 STOMP 프로토콜 오류:', frame.headers['message']);
        };

        // 6. 클라이언트 인스턴스를 ref에 저장하고 활성화
        clientRef.current = client;
        client.activate();

        // 7. 컴포넌트 언마운트 시 실행될 클린업 함수
        return () => {
            console.log('🧹 클린업 함수 실행: WebSocket 연결을 종료합니다.');
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null; // ref 초기화
            }
        };

    }, [user, onNotificationReceived]); // user나 콜백이 변경될 때만 effect 재실행
};