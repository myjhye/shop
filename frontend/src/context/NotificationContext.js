import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    const addNotification = useCallback((newNotification) => {
        const notificationWithMeta = { 
            ...newNotification, 
            id: Date.now(), // 고유 ID 부여
            read: false // 초기 '읽지 않음' 상태
        };
        setNotifications((prev) => [notificationWithMeta, ...prev]);
    }, []);
    
    // useNotifications 훅을 호출하고, 콜백으로 addNotification 함수를 전달합니다.
    // 사용자가 로그인했을 때만 훅이 동작하도록 user 객체를 확인합니다.
    useNotifications(user ? addNotification : null);
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ 
          ...n, 
          read: true 
        })));
    }, []);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const value = {
        notifications,
        unreadCount,
        addNotification, // 기존 함수는 그대로 유지
        removeNotification,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotificationsContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationsContext must be used within a NotificationProvider');
    }
    return context;
};