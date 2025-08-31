import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // 로컬 상태 대신 Context를 사용
import { formatPrice } from '../constants/format';
import { TrashIcon, MinusIcon, PlusIcon } from './Icons';
import { useOrder } from '../hooks/useOrder';

export default function MyCart() {
  // 1. Context로부터 모든 상태와 함수를 가져옴
  const { 
    cartItems, 
    isLoading, 
    error,
    updatingItems,
    fetchCart, 
    updateCartItemQuantity,
    deleteCartItem 
  } = useCart();
  
  const { createOrder, isLoading: isOrderLoading } = useOrder();

  // 2. 페이지에 처음 들어올 때 장바구니 데이터를 불러옴
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 수량 컨트롤 컴포넌트
  const QuantityControl = ({ item }) => {
    const isUpdating = updatingItems.has(item.cartItemId);
    
    return (
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
          disabled={item.quantity <= 1 || isUpdating}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          <MinusIcon />
        </button>
        <div className="w-12 h-8 flex items-center justify-center bg-white font-medium text-sm">
          {isUpdating ? '...' : item.quantity}
        </div>
        <button
          onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
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

  const handlePurchaseAll = () => {
    if (window.confirm("장바구니의 모든 상품을 주문하시겠습니까?")) {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      createOrder(orderItems);
    }
  };
  
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
          <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg">
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.cartItemId} className="flex items-center p-4 border rounded-lg">
                <img src={item.thumbnailUrl} alt={item.productName} className="w-20 h-20 rounded-lg"/>
                <div className="flex-grow ml-4">
                  <Link to={`/products/${item.productId}`} className="font-bold text-lg">{item.productName}</Link>
                  <p className="text-base">{formatPrice(item.price)}원</p>
                </div>
                <div className="flex items-center ml-4"><QuantityControl item={item} /></div>
                <div className="ml-6 font-semibold text-lg w-28 text-right">{formatPrice(item.price * item.quantity)}원</div>
                <button onClick={() => deleteCartItem(item.cartItemId)} className="ml-4 p-1">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <span>총 {cartItems.length}개 상품</span>
            <div className="flex items-center">
              <span>총 주문금액:</span>
              <span className="text-2xl font-extrabold ml-4">{formatPrice(totalPrice)}원</span>
              <button onClick={handlePurchaseAll} disabled={isOrderLoading} className="ml-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                {isOrderLoading ? '주문 처리 중...' : '주문하기'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}