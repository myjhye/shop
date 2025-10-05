import { useEffect } from 'react';
import { useStomp } from '../context/StompContext';
import { useAuth } from '../context/AuthContext';

export const useNotifications = (onNotificationReceived) => {
    const { stompClient } = useStomp();
    const { user } = useAuth();

    useEffect(() => {
        // 1. stompClient가 연결되었고, 유저 정보가 있을 때만 구독 로직 실행
        if (stompClient && stompClient.connected && user && user.username) {
            
            const personalTopic = `/topic/notifications/${user.username}`;

            console.log(`👂 STOMP 구독 시작: ${personalTopic}`);

            // 2. 구독 실행
            const subscription = stompClient.subscribe(personalTopic, (message) => {
                try {
                    const notification = JSON.parse(message.body);
                    if (typeof onNotificationReceived === 'function') {
                        onNotificationReceived(notification);
                    }
                } catch (error) {
                    console.error('🔴 알림 메시지 파싱 중 오류 발생:', error);
                }
            });

            // 3. 클린업 함수: 컴포넌트가 언마운트될 때 구독을 취소
            return () => {
                console.log(`🧹 STOMP 구독 취소: ${personalTopic}`);
                subscription.unsubscribe();
            };
        }
    // stompClient와 user 정보가 바뀔 때마다 effect를 재실행하여 구독 상태를 최신으로 유지
    }, [stompClient, user, onNotificationReceived]); 
};