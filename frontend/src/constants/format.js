// 가격을 원화 형식으로 포맷
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

// 날짜를 'YYYY. MM. DD.' 형식으로 포맷
export const formatDate = (dateString) => {
  // 1. dateString이 유효하지 않으면 빈 문자열을 반환하여 에러 방지
  if (!dateString) {
    return '';
  }

  // 2. 백엔드에서 온 날짜 문자열의 공백을 'T'로 변경
  const parsableDateString = dateString.replace(' ', 'T');
  
  // 3. 이제 JavaScript가 안정적으로 해석할 수 있는 형식으로 Date 객체를 생성
  const date = new Date(parsableDateString);
  
  // 4. 만약 그래도 유효하지 않은 날짜라면, 빈 문자열을 반환
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // 5. 원하는 형식으로 날짜를 출력
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};