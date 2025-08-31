import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/options';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();  // 인증 정보 가져오기
  const token = user?.token;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: ''
  });
  const [thumbnail, setThumbnail] = useState(null); // 새로 업로드할 이미지 파일
  const [originalThumbnail, setOriginalThumbnail] = useState(''); // 기존 이미지 URL
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. 컴포넌트 마운트 시 기존 상품 데이터를 불러옴
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
        const product = response.data;
        setFormData({
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          category: product.category
        });
        setOriginalThumbnail(product.thumbnail);
      } catch (err) {
        console.error("상품 정보 로딩 오류:", err);
        setError("상품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
    if (error) setError('');
  };

  // 2. 폼 제출 시 PUT 요청으로 데이터 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
      
      // 새 이미지를 선택한 경우에만 폼 데이터에 추가
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      await api.put(`/api/mypage/products/${id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('상품이 성공적으로 수정되었습니다!');
      navigate('/mypage');
      
    } catch (err) {
      console.error('상품 수정 오류:', err);
      setError(err.response?.data?.message || '상품 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">상품 정보를 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">상품 수정</h2>
          <p className="mt-2 text-lg text-gray-600">상품의 정보를 업데이트하세요.</p>
        </div>
        
        {error && <div className="mb-6 max-w-3xl mx-auto bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
            {/* --- 좌측: 이미지 영역 --- */}
            <div className="lg:col-span-1 space-y-8 mb-10 lg:mb-0">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <label className="block text-xl font-bold text-gray-800 mb-4">현재 이미지</label>
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img src={originalThumbnail} alt="Original thumbnail" className="w-full h-full object-cover"/>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <label className="block text-xl font-bold text-gray-800 mb-4">새 이미지 (선택)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* --- 우측: 폼 입력 영역 --- */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">상품명 *</label>
                  <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                    <input name="price" type="number" required value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">재고 수량 *</label>
                    <input name="stock" type="number" required value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">상품 설명</label>
                  <textarea name="description" rows="6" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Link to="/mypage" className="px-8 py-3 text-lg font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">취소</Link>
                  <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-lg font-medium text-white rounded-lg transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isSubmitting ? '수정 중...' : '수정 완료'}
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