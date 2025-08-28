import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/config';

// 가격을 원화 형식으로 포맷하는 함수
const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return new Intl.NumberFormat('ko-KR').format(price);
};

// SVG 아이콘 컴포넌트들
const MinusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"></path></svg>
);
const CartIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);


export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // 수량
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } 
      catch (err) {
        console.error('상품 상세 정보 로딩 오류:', err);
        setError('상품을 찾을 수 없습니다.');
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const totalPrice = product.price * quantity;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 브레드크럼 */}
        <nav className="text-sm mb-8">
          <ol className="list-none p-0 inline-flex space-x-2">
            <li className="flex items-center">
              <Link to="/" className="text-gray-500 hover:text-gray-700">홈</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <span className="text-gray-500">{product.category}</span>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-800 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-5 lg:gap-x-12">
          {/* 상품 이미지 영역 */}
          <div className="lg:col-span-2">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg border border-gray-200">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
          </div>

          {/* 상품 정보 및 액션 영역 */}
          <div className="mt-8 lg:mt-0 lg:col-span-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            <p className="text-3xl text-gray-900 mt-2">{formatPrice(product.price)}원</p>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>
            
            <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              재고: {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
            </p>

            <hr className="my-8 border-gray-200" />
            
            {/* 수량 선택 */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">수량</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={() => handleQuantityChange(-1)} className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled={quantity <= 1}>
                  <MinusIcon />
                </button>
                <span className="px-4 py-1 text-lg font-medium">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled={quantity >= product.stock}>
                  <PlusIcon />
                </button>
              </div>
            </div>
            
            {/* 총 상품 금액 */}
            <div className="mt-8 flex justify-between items-center">
              <span className="text-xl font-medium text-gray-900">총 상품 금액</span>
              <span className="text-3xl font-bold text-indigo-600">{formatPrice(totalPrice)}원</span>
            </div>

            {/* 구매 버튼 */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                disabled={product.stock === 0}
                className="flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <CartIcon />
                장바구니
              </button>
              <button
                disabled={product.stock === 0}
                className="flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400"
              >
                바로 구매
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}