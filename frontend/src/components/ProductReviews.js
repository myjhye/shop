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

  // --- 수정 관련 상태 ---
  const [editingReviewId, setEditingReviewId] = useState(null); // 현재 수정 중인 리뷰의 ID
  const [editText, setEditText] = useState(''); // 수정 중인 리뷰의 텍스트
  const [editRating, setEditRating] = useState(5); // 수정 중인 리뷰의 별점
  
  const { user, isLoggedIn } = useAuth();
  const token = user?.token;

  // 1. 리뷰 목록 로딩 useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${productId}/reviews`, {
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
          const response = await api.get('/orders/check-purchase', {
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
      await api.post(`/products/${productId}/reviews`, newReview, {
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

  // 별점 수정 핸들러
  const handleStartEdit = (review) => {
    setEditingReviewId(review.reviewId);
    setEditText(review.content);
    setEditRating(review.rating);
  };
  
  // 리뷰 작성 취소 핸들러
  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  // 리뷰 수정 핸들러
  const handleUpdateReview = async (reviewId) => {
    try {
      await api.put(`/products/${productId}/reviews/${reviewId}`, 
        { content: editText, rating: editRating },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert("리뷰가 수정되었습니다.");
      setEditingReviewId(null);
      setVersion(v => v + 1); // 목록 새로고침
    } catch (err) {
      alert("리뷰 수정에 실패했습니다.");
    }
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      try {
        await api.delete(`/products/${productId}/reviews/${reviewId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert("리뷰가 삭제되었습니다.");
        setVersion(v => v + 1); // 목록 새로고침
      } catch (err) {
        alert("리뷰 삭제에 실패했습니다.");
      }
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
        
        {/* 리뷰 작성 폼 (renderReviewForm 함수 호출 또는 직접 JSX 배치) */}
        {renderReviewForm()}
        
        {/* --- 리뷰 목록 --- */}
        {isLoading ? <p className="text-center py-10">리뷰를 불러오는 중...</p> : 
         error ? <p className="text-center py-10 text-red-500">{error}</p> :
         reviewsPage && reviewsPage.content.length > 0 ? (
          <>
            <ul className="space-y-8">
              {reviewsPage.content.map(review => (
                <li key={review.reviewId} className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-gray-50">
                  {/* 사용자 아바타 */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {review.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* 리뷰 내용 또는 수정 폼 */}
                  <div className="flex-grow">
                    {editingReviewId === review.reviewId ? (
                      // --- 수정 모드 UI ---
                      <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-gray-900 text-lg">{review.username}</p>
                        </div>
                        <StarRating rating={editRating} setRating={setEditRating} />
                        <textarea 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          rows="3" 
                          className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
                        />
                        <div className="flex space-x-2 justify-end mt-2">
                          <button onClick={handleCancelEdit} className="px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-200">취소</button>
                          <button onClick={() => handleUpdateReview(review.reviewId)} className="px-3 py-1 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">저장</button>
                        </div>
                      </div>
                    ) : (
                      // --- 일반 모드 UI ---
                      <div>
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
                          <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                            {/* 수정/삭제 버튼을 날짜 옆에 고정 표시 */}
                            {isLoggedIn && user.username === review.username && (
                              <div className="flex space-x-2">
                                <button onClick={() => handleStartEdit(review)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">수정</button>
                                <button onClick={() => handleDeleteReview(review.reviewId)} className="text-sm text-red-500 hover:text-red-700 font-medium">삭제</button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="my-1">
                          <StarRating rating={review.rating} readOnly={true} />
                        </div>
                        <p className="text-gray-700 mt-3 leading-relaxed">{review.content}</p>
                      </div>
                    )}
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
          <p className="text-center py-10 text-gray-500">아직 등록된 리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
}