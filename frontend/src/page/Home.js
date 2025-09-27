import { useState, useEffect } from 'react';
import api from '../api/config';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { CATEGORIES, PRICE_RANGES, SORT_OPTIONS } from '../constants/options';

export default function Home() {
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 선택된 카테고리
  const [selectedPrice, setSelectedPrice] = useState('all'); // 선택된 가격 범위
  const [sort, setSort] = useState(SORT_OPTIONS[0].value); // 정렬
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          size: ITEMS_PER_PAGE,
          sort: sort,
        };

        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        // 선택된 가격 범위에 따라 minPrice, maxPrice 파라미터 추가
        if (selectedPrice !== 'all') {
          const range = PRICE_RANGES.find(r => r.key === selectedPrice);
          if (range) {
            if (range.min !== undefined) params.minPrice = range.min;
            if (range.max !== undefined) params.maxPrice = range.max;
          }
        }
        
        const response = await api.get('/products', { params });
        setPageData(response.data);
      } 
      catch (err) {
        setError('상품 목록을 불러오는 데 실패했습니다.');
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedCategory, selectedPrice, sort]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 카테고리 필터 변경 핸들러
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 리셋
  };

  // 가격 필터 변경 핸들러
  const handlePriceChange = (priceKey) => {
    setSelectedPrice(priceKey);
    setCurrentPage(0); // 가격 필터 변경 시 첫 페이지로 리셋
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setCurrentPage(0);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(0); // 정렬 기준 변경 시 첫 페이지로 리셋
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
    <div className="min-h-screen bg-gray-100">
      {/* --- 헤더 섹션 --- */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Our Products
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            최고의 상품을 합리적인 가격에 만나보세요.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-x-8">
          {/* --- 필터 사이드바 (데스크탑) --- */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-8 bg-white p-6 rounded-2xl shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">필터</h2>
                <button 
                  onClick={handleResetFilters}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  초기화
                </button>
              </div>

              {/* 카테고리 필터 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리</h3>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleCategoryChange('all')} className={`w-full text-left ${selectedCategory === 'all' ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-black'}`}>전체</button>
                  </li>
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button onClick={() => handleCategoryChange(cat)} className={`w-full text-left ${selectedCategory === cat ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-black'}`}>{cat}</button>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 가격 필터 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">가격대</h3>
                <ul className="space-y-2">
                  {PRICE_RANGES.map(range => (
                    <li key={range.key}>
                      <button onClick={() => handlePriceChange(range.key)} className={`w-full text-left ${selectedPrice === range.key ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-black'}`}>{range.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* --- 상품 그리드 영역 --- */}
          <div className="lg:col-span-3">
            {/* 필터 (모바일) */}
            <div className="lg:hidden bg-white p-4 rounded-xl shadow-md mb-8 space-y-4">
               {/* 모바일용 필터 UI... (간략화된 버전 또는 드롭다운으로 구현 가능) */}
               <details>
                 <summary className="font-semibold cursor-pointer">필터 열기</summary>
                 <div className="mt-4 space-y-4">
                    {/* 카테고리 필터 */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2">카테고리</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCategoryChange('all')} className={`px-3 py-1.5 text-xs rounded-full ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}># 전체</button>
                        {CATEGORIES.map(cat => <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-3 py-1.5 text-xs rounded-full ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}># {cat}</button>)}
                      </div>
                    </div>
                    {/* 가격 필터 */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2">가격대</h3>
                       <div className="flex flex-wrap gap-2">
                        {PRICE_RANGES.map(range => <button key={range.key} onClick={() => handlePriceChange(range.key)} className={`px-3 py-1.5 text-xs rounded-full ${selectedPrice === range.key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>{range.label}</button>)}
                      </div>
                    </div>
                 </div>
               </details>
            </div>

            {/* 상품 개수 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">상품 목록</h2>
              <div className="flex items-center space-x-4">
                {pageData && <span className="text-sm text-gray-600">총 {pageData.totalElements}개</span>}
                <select 
                  value={sort}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pageData && pageData.content.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {pageData.content.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {pageData.totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={pageData.totalPages} onPageChange={handlePageChange} />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">조건에 맞는 상품이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}