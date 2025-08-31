import { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/config';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const { user } = useAuth();  // 인증 정보 가져오기
  const token = user?.token;

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
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
  }, [token]);

  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await api.put(`/api/cart/items/${cartItemId}`, { quantity: newQuantity }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchCart(); // 성공 시 장바구니 전체를 다시 불러옴
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

  const deleteCartItem = async (cartItemId) => {
    if (window.confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/cart/items/${cartItemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await fetchCart(); // 성공 시 장바구니 전체를 다시 불러옴
      } catch (err) {
        alert("상품 삭제에 실패했습니다.");
      }
    }
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    isLoading,
    error,
    updatingItems,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    fetchCart,
    updateCartItemQuantity,
    deleteCartItem,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};