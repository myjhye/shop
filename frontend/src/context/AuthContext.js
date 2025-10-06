import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, logout as authLogout, saveUserData } from '../utils/auth';

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
    // 초기 로드 시 localStorage에서 사용자 정보 불러오기
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // 서버로부터 받은 id가 포함된 userData 전체를 저장
    saveUserData(userData);
    setUser(userData);
  };

  const logout = () => {
    authLogout(); // localStorage에서 사용자 정보 모두 제거
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