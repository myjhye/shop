import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../constants/format';
import { TrashIcon, MinusIcon, PlusIcon } from './Icons';

export default function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const [updatingItems, setUpdatingItems] = useState(new Set()); // 업데이트 중인 아이템들
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
        alert("장바구니를 보려면 로그인이 필요합니다.");
        navigate('/login');
        return;
    }

    const fetchCartItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCartItems(response.data);
      } catch (err) {
        console.error("장바구니 조회 오류:", err);
        setError("장바구니 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [token, navigate, version]);

  const handleQuantityUpdate = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // 업데이트 중인 아이템 표시
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    
    try {
      await api.put(`/api/cart/items/${cartItemId}`, { quantity: newQuantity }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVersion(v => v + 1);
    } catch (err) {
      alert("수량 변경에 실패했습니다.");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleDeleteItem = async (cartItemId) => {
    if (window.confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/cart/items/${cartItemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setVersion(v => v + 1);
      } catch (err) {
        alert("상품 삭제에 실패했습니다.");
      }
    }
  };

  // 수량 컨트롤 컴포넌트
  const QuantityControl = ({ item }) => {
    const isUpdating = updatingItems.has(item.cartItemId);
    
    return (
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => handleQuantityUpdate(item.cartItemId, item.quantity - 1)}
          disabled={item.quantity <= 1 || isUpdating}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MinusIcon />
        </button>
        <div className="w-12 h-8 flex items-center justify-center bg-white font-medium text-sm">
          {isUpdating ? '...' : item.quantity}
        </div>
        <button
          onClick={() => handleQuantityUpdate(item.cartItemId, item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon />
        </button>
      </div>
    );
  };

  const totalPrice = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <p className="text-xl">장바구니를 불러오는 중...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-64">
            <p className="text-xl text-red-500">{error}</p>
        </div>
    );
  }

  return (
    <div className="p-6">
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl text-gray-500">장바구니가 비어있습니다.</p>
          <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.cartItemId} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.productName} 
                  className="w-20 h-20 rounded-lg object-cover shadow-sm flex-shrink-0"
                />
                <div className="flex-grow ml-4 min-w-0">
                  <Link 
                    to={`/products/${item.productId}`} 
                    className="font-bold text-lg text-gray-800 hover:text-blue-600 block truncate"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-gray-600 mt-1 text-base">{formatPrice(item.price)}원</p>
                </div>
                
                <div className="flex items-center ml-4">
                  <QuantityControl item={item} />
                </div>
                
                <div className="ml-6 font-semibold text-lg w-28 text-right flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}원
                </div>
                
                <button 
                  onClick={() => handleDeleteItem(item.cartItemId)} 
                  className="ml-4 text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-lg text-gray-600">총 {cartItems.length}개 상품</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">총 주문금액:</span>
              <span className="text-2xl font-extrabold text-blue-600 ml-4">{formatPrice(totalPrice)}원</span>
              <button className="ml-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                주문하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}