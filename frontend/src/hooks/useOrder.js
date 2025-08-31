import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder as createOrderService } from '../services/orderService';
import { useCart } from '../context/CartContext';

export const useOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();  // 인증 정보 가져오기
  const token = user?.token;
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const createOrder = async (orderItems) => {
    if (!token) {
      alert("주문을 위해 로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await createOrderService(orderItems, token);
      alert('주문이 완료되었습니다!');
      clearCart(); // 성공 시 장바구니 비우기
      navigate('/'); // 성공 시 홈으로 이동
    } catch (err) {
      setError(err.toString());
      alert(err.toString()); // 에러 메시지 표시 (예: "재고가 부족합니다.")
    } finally {
      setIsLoading(false);
    }
  };

  return { createOrder, isLoading, error };
};