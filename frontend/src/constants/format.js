// 가격을 원화 형식으로 포맷
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  // toLocaleDateString을 사용하여 지역화된 날짜 형식으로 변환
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};