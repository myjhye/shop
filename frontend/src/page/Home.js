import { useState, useEffect } from 'react';
import api from '../api/config';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/products');
        setProducts(response.data);
      } 
      catch (err) {
        setError('상품 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">등록된 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}