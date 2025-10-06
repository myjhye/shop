import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ChatIcon, NavCartIcon } from './Icons';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
              <>
                <Link to="/add-product" className="text-gray-700 hover:text-blue-600 px-3 py-2">상품 등록</Link>
                <Link to="/mypage" className="text-gray-700 hover:text-blue-600 px-3 py-2">마이페이지</Link>
                
                <span className="text-gray-700 px-3 py-2">
                  안녕하세요, <span className="text-blue-500">{user?.username}</span>님
                </span>
                <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  로그아웃
                </button>

                {/* --- 채팅 목록 아이콘 --- */}
                <Link to="/chat" className="relative text-gray-500 hover:text-blue-600 p-2">
                  <ChatIcon />
                </Link>

                {/* --- 장바구니 아이콘 --- */}
                <Link to="/mypage?tab=cart" className="relative text-gray-500 hover:text-blue-600 p-2">
                  <NavCartIcon />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
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