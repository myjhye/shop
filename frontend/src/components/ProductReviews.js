import { useState, useEffect } from 'react';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import Pagination from './Pagination';
import { formatDate } from '../constants/format';
import { Link } from 'react-router-dom';

export default function ProductReviews({ productId }) {
  const [reviewsPage, setReviewsPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [version, setVersion] = useState(0);
  
  const { user, isLoggedIn } = useAuth();
  const token = user?.token;

  // 1. 리뷰 목록 로딩 useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/products/${productId}/reviews`, {
          params: { page: currentPage, size: 3, sort: 'createdAt,desc' }
        });
        setReviewsPage(response.data);
      } catch (err) {
        setError("리뷰를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [productId, currentPage, version]);

  // --- 구매 이력 확인 useEffect ---
  useEffect(() => {
    // 로그인한 상태일 때만 구매 이력을 확인
    if (isLoggedIn) {
      setIsCheckingPurchase(true);
      const checkPurchase = async () => {
        try {
          const response = await api.get('/api/orders/check-purchase', {
            params: { productId },
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setCanWriteReview(response.data.hasPurchased);
        } catch (err) {
          console.error("구매 이력 확인 오류:", err);
          setCanWriteReview(false); // 에러 발생 시 작성 불가 처리
        } finally {
          setIsCheckingPurchase(false);
        }
      };
      checkPurchase();
    } else {
      setCanWriteReview(false);
      setIsCheckingPurchase(false);
    }
  }, [productId, isLoggedIn, token]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
    if (submitError) setSubmitError('');
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
      await api.post(`/api/products/${productId}/reviews`, newReview, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("리뷰가 성공적으로 등록되었습니다.");
      setNewReview({ rating: 5, content: '' });
      setVersion(v => v + 1);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "리뷰 등록에 실패했습니다.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderReviewForm = () => {
    if (!isLoggedIn) {
      // 1. 로그인 X
      return (
        <div className="bg-gray-50 p-8 rounded-lg mb-10 border text-center">
          <h3 className="text-xl font-semibold">리뷰를 작성하시겠어요?</h3>
          <p className="text-gray-600 my-4">로그인하여 상품에 대한 소중한 의견을 공유해주세요!</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
            로그인하러 가기
          </Link>
        </div>
      );
    }

    if (isCheckingPurchase) {
      // 2. 구매 이력 확인 중인 경우 (로딩)
      return <div className="bg-gray-50 p-6 rounded-lg mb-10 border text-center">구매 이력을 확인 중입니다...</div>;
    }

    if (canWriteReview) {
      // 3. 로그인 O, 구매 이력 O
      return (
        <div className="bg-gray-50 p-6 rounded-lg mb-10 border">
            <form onSubmit={handleReviewSubmit}>
                <h3 className="text-lg font-semibold mb-2">{user.username}님, 상품은 어떠셨나요?</h3>
                <div className="flex items-center mb-4">
                    <span className="mr-2">별점:</span>
                    <StarRating rating={newReview.rating} setRating={(r) => setNewReview({ ...newReview, rating: r })} />
                </div>
                <textarea 
                    name="content" 
                    value={newReview.content} 
                    onChange={handleReviewChange} 
                    rows="4" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="리뷰 내용을 입력해주세요. (구매한 상품만 작성 가능)"
                />
                {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
                <div className="text-right mt-4">
                    <button type="submit" disabled={isSubmittingReview} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
                    {isSubmittingReview ? '등록 중...' : '리뷰 등록'}
                    </button>
                </div>
          </form>
        </div>
      );
    } else {
      // 4. 로그인 O, 구매 이력 X
      return (
        <div className="bg-gray-50 p-8 rounded-lg mb-10 border text-center">
          <h3 className="text-xl font-semibold">리뷰 작성 권한이 없습니다.</h3>
          <p className="text-gray-600 mt-4">이 상품을 구매한 사용자만 리뷰를 작성할 수 있습니다.</p>
        </div>
      );
    }
  };

  return (
    <div className="border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">상품 리뷰</h2>
        
        {renderReviewForm()}
        
        {isLoading ? <p>리뷰를 불러오는 중...</p> : 
         error ? <p className="text-red-500">{error}</p> :
         reviewsPage && reviewsPage.content.length > 0 ? (
          <>
            <ul className="space-y-8">
                {reviewsPage.content.map(review => (
                    <li key={review.reviewId} className="flex items-start space-x-4">
                    {/* 사용자 아바타 */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                            {review.username.charAt(0).toUpperCase()}
                        </span>
                        </div>
                    </div>

                    {/* 리뷰 내용 */}
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2">
                                <p className="font-bold text-gray-900 text-lg">{review.username}</p>
                                {review.purchased && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        구매자
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="my-1">
                        <StarRating rating={review.rating} readOnly={true} />
                        </div>
                        <p className="text-gray-700 mt-3 leading-relaxed">{review.content}</p>
                    </div>
                    </li>
                ))}
            </ul>
            {reviewsPage.totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={reviewsPage.totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">아직 등록된 리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
}