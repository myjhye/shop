import api from '../api/config';

// 주문 생성 API 호출
export const createOrder = async (orderItems, token) => {
  try {
    const response = await api.post('/orders', 
      { orderItems }, // 요청 Body
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("주문 생성 오류:", error);
    throw error.response?.data || new Error("주문 생성에 실패했습니다."); // 백엔드에서 보낸 에러 메시지를 우선적으로 사용
  }
};