import { useState, useEffect } from 'react';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import Pagination from './Pagination';
import { formatPrice, formatDate } from '../constants/format';
import { Link } from 'react-router-dom';

export default function MyOrders() {
    const [ordersPage, setOrdersPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();  // 인증 정보 가져오기
    const token = user?.token;

    useEffect(() => {
        if (!token) return;

        const fetchMyOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/mypage/orders', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        page: currentPage,
                        size: 5, // 한 페이지에 5개의 주문 표시
                        sort: 'orderDate,desc'
                    }
                });
                setOrdersPage(response.data);
            } catch (err) {
                setError("주문 내역을 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyOrders();
    }, [currentPage, token]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) return <div className="p-6 text-center">주문 내역을 불러오는 중...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6">
            {ordersPage && ordersPage.content.length > 0 ? (
                <>
                    <div className="space-y-6">
                        {ordersPage.content.map(order => (
                            <div key={order.orderId} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                                <div className="p-4 bg-gray-100 border-b rounded-t-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">주문번호: {order.orderId}</p>
                                        <p className="text-sm text-gray-500">주문일자: {formatDate(order.orderDate)}</p>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">{formatPrice(order.totalPrice)}원</p>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="p-4 flex items-center space-x-4">
                                            <img 
                                              src={item.thumbnailUrl} 
                                              alt={item.productName}
                                              className="w-16 h-16 rounded-md object-cover flex-shrink-0 border" 
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium text-gray-800">{item.productName}</p>
                                                <p className="text-sm text-gray-500">{formatPrice(item.orderPrice)}원 / {item.quantity}개</p>
                                            </div>
                                            <Link 
                                                to={`/products/${item.productId}`}
                                                className="ml-auto bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 text-sm font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                리뷰 작성하기
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    {ordersPage.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={ordersPage.totalPages} 
                                onPageChange={handlePageChange} 
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">주문 내역이 없습니다.</p>
                </div>
            )}
        </div>
    );
}