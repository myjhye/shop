import { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const StompContext = createContext(null);

export const useStomp = () => useContext(StompContext);

export const StompProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.token) {
      console.log('STOMP: 연결을 시작합니다...');
      const wsUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/ws'
        : process.env.REACT_APP_WEBSOCKET_URL;

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
        reconnectDelay: 5000,
        debug: (str) => {
          console.log(`STOMP DEBUG: ${str}`);
        },
      });

      client.onConnect = () => {
        console.log('✅ STOMP: WebSocket에 연결되었습니다.');
        setStompClient(client);
      };

      client.onStompError = (frame) => {
        console.error('🔴 STOMP 프로토콜 오류:', frame.headers['message'], frame.body);
      };

      client.activate();

      return () => {
        if (client.connected) {
          console.log('STOMP: 연결을 종료합니다.');
          client.deactivate();
        }
      };
    } else if (stompClient) {
        console.log('STOMP: 로그아웃 상태이므로 연결을 종료합니다.');
        stompClient.deactivate();
        setStompClient(null);
    }
  }, [user]);

  return (
    <StompContext.Provider value={{ stompClient }}>
      {children}
    </StompContext.Provider>
  );
};