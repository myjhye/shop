import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              ShopMall
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            >
              홈
            </Link>
            
            {isLoggedIn ? (
              // 로그인된 상태
              <>
                <Link
                  to="/add-product"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  상품 등록
                </Link>

                <Link
                  to="/mypage"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  마이페이지
                </Link>
                
                <span className="text-gray-700 px-3 py-2 text-base">
                  안녕하세요, <span className="text-blue-500">{user?.username}</span>님
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  로그아웃
                </button>
              </>
            ) : (
              // 로그인되지 않은 상태
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}