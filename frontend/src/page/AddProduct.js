import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/options';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
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
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file)); // 파일 선택 시 미리보기 URL 생성
      if (error) setError('');
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">새 상품 등록</h2>
          <p className="mt-2 text-lg text-gray-600">판매할 상품의 정보를 입력해주세요.</p>
        </div>
        
        {error && <div className="mb-6 max-w-3xl mx-auto bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
            {/* --- 좌측: 이미지 영역 --- */}
            <div className="lg:col-span-1 space-y-8 mb-10 lg:mb-0">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <label className="block text-xl font-bold text-gray-800 mb-4">상품 이미지 *</label>
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg overflow-hidden">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 미리보기
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  required
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-500 mt-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* --- 우측: 폼 입력 영역 --- */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">상품명 *</label>
                  <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="상품명을 입력하세요" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">카테고리 *</label>
                  <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">가격 *</label>
                    <input name="price" type="number" required value={formData.price} onChange={handleChange} placeholder="가격을 입력하세요" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">재고 수량 *</label>
                    <input name="stock" type="number" required value={formData.stock} onChange={handleChange} placeholder="재고 수량을 입력하세요" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">상품 설명</label>
                  <textarea name="description" rows="6" value={formData.description} onChange={handleChange} placeholder="상품에 대한 자세한 설명을 입력하세요..." className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Link to="/" className="px-8 py-3 text-lg font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">취소</Link>
                  <button type="submit" disabled={isLoading} className={`px-8 py-3 text-lg font-medium text-white rounded-lg transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isLoading ? '등록 중...' : '상품 등록'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}