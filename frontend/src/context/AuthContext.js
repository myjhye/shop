import { createContext, useContext, useState, useEffect } from 'react';
import { isLoggedIn, getUser, logout as authLogout, saveToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 로그인 상태 확인
    if (isLoggedIn()) {
      setUser(getUser());
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    saveToken(userData.token, userData.username, userData.email); // localStorage에 토큰 저장
    setUser(userData);
  };

  const logout = () => {
    authLogout(); // localStorage에서 토큰 제거
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoggedIn: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};