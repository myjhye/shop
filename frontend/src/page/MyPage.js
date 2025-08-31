import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MyProducts from '../components/MyProducts';
import MyCart from '../components/MyCart';
import MyOrders from '../components/MyOrders';
import MyReviews from '../components/MyReviews';

export default function MyPage() {
    const [activeTab, setActiveTab] = useState('products');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const tabDescriptions = {
        products: '내가 등록한 상품을 수정하거나 삭제할 수 있습니다.',
        cart: '장바구니에 담긴 상품들을 확인하고 주문하세요.',
        orders: '최근 주문 내역을 확인할 수 있습니다.',
        reviews: '내가 등록한 리뷰를 확인할 수 있습니다.'
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tab = urlParams.get('tab');
        if (tab === 'cart') setActiveTab('cart');
        else if (tab === 'orders') setActiveTab('orders');
        else if (tab === 'reviews') setActiveTab('reviews');
        else setActiveTab('products');
    }, [location.search]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
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
                        <p className="text-base text-gray-600 mt-1">{tabDescriptions[activeTab]}</p>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => handleTabChange('products')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ... ${
                                    activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                                }`}
                            >
                                내 상품 관리
                            </button>
                            <button
                                onClick={() => handleTabChange('cart')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ... ${
                                    activeTab === 'cart' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                장바구니
                            </button>
                            <button
                                onClick={() => handleTabChange('orders')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'orders'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                주문 내역
                            </button>
                            <button 
                                onClick={() => handleTabChange('reviews')} 
                                className={`py-4 px-6 ... ${
                                    activeTab === 'reviews' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                내가 쓴 리뷰
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="bg-white rounded-lg shadow-sm min-h-[32rem]">
                    {activeTab === 'products' && <MyProducts />}
                    {activeTab === 'cart' && <MyCart />}
                    {activeTab === 'orders' && <MyOrders />}
                    {activeTab === 'reviews' && <MyReviews />}
                </div>
            </div>
        </div>
    );
}