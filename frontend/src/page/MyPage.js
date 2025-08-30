import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MyProducts from '../components/MyProducts';
import MyCart from '../components/MyCart';

export default function MyPage() {
    const [activeTab, setActiveTab] = useState('products');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // URL 쿼리 파라미터로 탭 결정
        const urlParams = new URLSearchParams(location.search);
        const tab = urlParams.get('tab');
        if (tab === 'cart') {
            setActiveTab('cart');
        } else {
            setActiveTab('products');
        }
    }, [location.search]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // URL 업데이트
        navigate(`/mypage?tab=${tab}`, { replace: true });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* 사용자 정보 헤더 */}
                <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 flex-shrink-0">
                        {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{user?.username}님의 페이지</h2>
                        <p className="text-base text-gray-600 mt-1">내 상품과 장바구니를 관리하세요.</p>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => handleTabChange('products')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'products'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                내 상품
                            </button>
                            <button
                                onClick={() => handleTabChange('cart')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'cart'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                장바구니
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="bg-white rounded-lg shadow-sm min-h-96">
                    {activeTab === 'products' && <MyProducts />}
                    {activeTab === 'cart' && <MyCart />}
                </div>
            </div>
        </div>
    );
}