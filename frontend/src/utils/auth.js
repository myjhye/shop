// 토큰 및 사용자 정보 저장
export const saveUserData = (userData) => {
  localStorage.setItem('id', userData.id);
  localStorage.setItem('token', userData.token);
  localStorage.setItem('username', userData.username);
  localStorage.setItem('email', userData.email);
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 사용자 정보 가져오기
export const getUser = () => {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  
  // id나 token이 없으면 로그인되지 않은 상태로 간주
  if (!id || !token) {
    return null;
  }
  
  return { id, token, username, email };
};

// 로그인 상태 확인
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token; // token이 있으면 true, 없으면 false
};

// 로그아웃 (사용자 정보 전체 삭제)
export const logout = () => {
  localStorage.removeItem('id');
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
};