import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!thumbnail) {
      setError('상품 이미지를 선택해주세요.');
      return;
    }

    if (!formData.category) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('data', JSON.stringify({
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        stock: parseInt(formData.stock),
        category: formData.category
      }));
      
      formDataToSend.append('thumbnail', thumbnail);

      await api.post('/api/products', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('상품이 등록되었습니다!');
      navigate('/');
      
    } catch (error) {
      console.error('상품 등록 오류:', error);
      
      if (error.response) {
        setError(error.response.data?.message || '상품 등록에 실패했습니다.');
      } else if (error.request) {
        setError('서버와의 연결에 실패했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">상품 등록</h2>
          <p className="text-lg text-gray-600">새로운 상품을 등록해보세요</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-8 py-10">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="text-red-700">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    상품명 *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="상품명을 입력하세요"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    카테고리 *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORIES.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">가격 *</label>
                  <div className="relative">
                    <input
                      name="price"
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="가격을 입력하세요"
                      value={formData.price}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-gray-500 text-lg">원</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">재고 수량 *</label>
                  <div className="relative">
                    <input
                      name="stock"
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="재고 수량을 입력하세요"
                      value={formData.stock}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-gray-500 text-lg">개</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">상품 이미지 *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">상품 설명</label>
                <textarea
                  name="description"
                  rows="6"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="상품에 대한 자세한 설명을 입력하세요..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <Link
                  to="/"
                  className="px-8 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 text-lg font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? '등록 중...' : '상품 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}