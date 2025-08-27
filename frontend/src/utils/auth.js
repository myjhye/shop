// 토큰 저장
export const saveToken = (token, username, email) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('email', email);
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 사용자 정보 가져오기
export const getUser = () => {
  return {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email')
  };
};

// 로그인 상태 확인
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token; // token이 있으면 true, 없으면 false
};

// 로그아웃 (토큰 삭제)
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
};