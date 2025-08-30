import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '../constants/format';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
        <div className="w-full h-64 bg-gray-200">
          <img 
            src={product.thumbnail} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 flex-grow">
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatPrice(product.price)}원
          </p>
          <p className="text-xs text-gray-400 mt-2 text-right">
            {formatDate(product.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}