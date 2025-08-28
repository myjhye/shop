import { useState, useEffect } from 'react';
import api from '../api/config';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function Home() {
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // API 호출 시 page와 size 파라미터를 추가
        const response = await api.get('/api/products', {
          params: {
            page: currentPage,
            size: ITEMS_PER_PAGE,
            sort: 'createdAt,desc' // 최신순으로 정렬
          }
        });
        setPageData(response.data); // 응답 객체 전체를 상태에 저장
      } catch (err) {
        setError('상품 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // currentPage가 변경될 때마다 API를 다시 호출

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">상품 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- 헤더 섹션 --- */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            온라인 쇼핑몰
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            최고의 상품을 합리적인 가격에 만나보세요
          </p>
        </div>
      </div>

      {/* --- 상품 목록 섹션 --- */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">전체 상품</h2>
        {pageData && pageData.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* pageData.content가 실제 상품 목록 배열 */}
              {pageData.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pageData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pageData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">등록된 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}