export const CATEGORIES = [
  '전자제품',
  '의류',
  '도서',
  '스포츠/레저',
  '뷰티',
  '식품',
  '가구/인테리어',
  '완구/취미',
  '기타'
];

export const PRICE_RANGES = [
  { key: 'all', label: '전체 가격' },
  { key: '0-10000', label: '1만원 이하', min: 0, max: 10000 },
  { key: '10000-30000', label: '1만원 ~ 3만원', min: 10000, max: 30000 },
  { key: '30000-50000', label: '3만원 ~ 5만원', min: 30000, max: 50000 },
  { key: '50000-', label: '5만원 이상', min: 50000 },
];