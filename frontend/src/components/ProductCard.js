import { Link } from 'react-router-dom';

// 가격을 원화 형식으로 포맷
const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="w-full h-64 bg-gray-200">
          <img 
            src={product.thumbnail} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600">
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatPrice(product.price)}원
          </p>
        </div>
      </div>
    </Link>
  );
}