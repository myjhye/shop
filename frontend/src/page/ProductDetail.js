import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartIcon, MinusIcon, PlusIcon } from '../components/Icons';
import { useOrder } from '../hooks/useOrder';
import { formatPrice } from '../constants/format';
import api from '../api/config';

import ProductReviews from '../components/ProductReviews';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // 수량
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { createOrder, isLoading: isOrderLoading } = useOrder();

  const { user, isLoggedIn } = useAuth();  // 인증 정보 가져오기
  const token = user?.token;
  const navigate = useNavigate();

  // --- 리뷰 관련 상태 ---
  const [reviewsPage, setReviewsPage] = useState(null);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [version, setVersion] = useState(0);

  // 1. 상품 정보 로딩 useEffect
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products/${id}`);
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

  // 2. 리뷰 목록 로딩 useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/products/${id}/reviews`, {
          params: { page: reviewCurrentPage, size: 5 }
        });
        setReviewsPage(response.data);
      } catch (err) {
        console.error("리뷰 로딩 오류:", err);
      }
    };
    fetchReviews();
  }, [id, reviewCurrentPage, version]); // version이 바뀌면 리뷰 목록 새로고침

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart/items', 
        {
          productId: id,
          quantity: quantity,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (window.confirm("장바구니에 상품이 담겼습니다. 장바구니로 이동하시겠습니까?")) {
        navigate('/cart');
      }

    } catch (err) {
      console.error("장바구니 추가 오류:", err);
      alert(err.response?.data?.message || "장바구니 추가에 실패했습니다.");
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
  };

  const handlePurchase = () => {
    // 1. 로그인 여부 먼저 확인
    if (!user?.token) {
      alert("주문을 위해 로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    // 2. 로그인 되어 있으면 구매 확인
    if (window.confirm("이 상품을 바로 구매하시겠습니까?")) {
      const orderItems = [{ productId: id, quantity: quantity }];
      createOrder(orderItems);
    }
  };

  // --- 리뷰 작성 핸들러 ---
  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.content.trim() === '') {
      setSubmitError("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReview(true);
    setSubmitError('');
    try {
      await api.post(`/products/${id}/reviews`, newReview, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("리뷰가 성공적으로 등록되었습니다.");
      setNewReview({ rating: 5, content: '' }); // 폼 초기화
      setVersion(v => v + 1); // 리뷰 목록 새로고침
    } catch (err) {
      console.error("리뷰 등록 오류:", err);
      setSubmitError(err.response?.data?.message || "리뷰 등록에 실패했습니다.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

        {/* --- 1. 상품 상세 정보 --- */}
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
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <CartIcon />
                장바구니
              </button>
              <button
                onClick={handlePurchase} 
                disabled={isOrderLoading}
                className="flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400"
              >
                바로 구매
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. 리뷰 섹션 --- */}
      <ProductReviews productId={id} />
    </div>
  );
}