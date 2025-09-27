import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import MyProductCard from './MyProductCard';
import Pagination from './Pagination';

export default function MyProducts() {
    const [pageData, setPageData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [version, setVersion] = useState(0); // 목록 새로고침
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();  // 인증 정보 가져오기
    const token = user?.token;
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchMyProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/mypage/products', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page: currentPage,
                        size: ITEMS_PER_PAGE,
                        sort: 'createdAt,desc' // 최신순으로 정렬
                    }
                });
                setPageData(response.data);
            } catch (err) {
                console.error("내 상품 목록 조회 오류:", err);
                setError("상품 목록을 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyProducts();
    }, [currentPage, token, navigate, version]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (productId) => {
        // 1. 사용자에게 정말 삭제할 것인지 확인받음
        if (window.confirm("정말로 이 상품을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) {
            try {
                // 2. 서버에 DELETE 요청 전송
                await api.delete(`/mypage/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert("상품이 성공적으로 삭제되었습니다.");

                // 3. UI 새로고침
                // 현재 페이지에 상품이 하나만 남아있었고, 그게 첫 페이지가 아닐 경우
                if (pageData.content.length === 1 && currentPage > 0) {
                    // 이전 페이지로 이동하여 리프레시
                    setCurrentPage(currentPage - 1);
                } else {
                    // 그 외의 경우, 현재 페이지를 강제로 리프레시
                    setVersion(prevVersion => prevVersion + 1);
                }
            } catch (error) {
                console.error("상품 삭제 오류:", error);
                alert(error.response?.data?.message || "상품 삭제에 실패했습니다.");
            }
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl">내 상품 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="p-6">
            {pageData && pageData.content.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {pageData.content.map(product => (
                            <MyProductCard key={product.id} product={product} onDelete={handleDelete} />
                        ))}
                    </div>
                    
                    {pageData.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={pageData.totalPages} 
                                onPageChange={handlePageChange} 
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">등록한 상품이 없습니다.</p>
                </div>
            )}
        </div>
    );
}