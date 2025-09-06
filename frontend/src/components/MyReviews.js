import { useState, useEffect } from 'react';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import Pagination from './Pagination';
import StarRating from './StarRating'; // StarRating 컴포넌트 임포트
import { formatDate } from '../constants/format';

export default function MyReviews() {
    const [reviewsPage, setReviewsPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();  // 인증 정보 가져오기
    const token = user?.token;

    useEffect(() => {
        if (!token) return;

        const fetchMyReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/api/mypage/reviews', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { page: currentPage, size: 5 }
                });
                setReviewsPage(response.data);
            } catch (err) {
                setError("내가 쓴 리뷰를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyReviews();
    }, [currentPage, token]);

    const handlePageChange = (page) => setCurrentPage(page);

    if (isLoading) return <div className="p-6 text-center">리뷰 내역을 불러오는 중...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6">
            {reviewsPage && reviewsPage.content.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {reviewsPage.content.map(review => (
                            <div key={review.reviewId} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border">
                                <img src={review.productThumbnailUrl} alt="product thumbnail" className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <StarRating rating={review.rating} readOnly={true} />
                                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{review.productName}</h3>
                                    <p className="mt-2 text-gray-700">{review.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {reviewsPage.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={reviewsPage.totalPages} 
                                onPageChange={handlePageChange} 
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">작성한 리뷰가 없습니다.</p>
                </div>
            )}
        </div>
    );
}