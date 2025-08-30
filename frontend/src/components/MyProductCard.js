import { Link } from 'react-router-dom';
import { formatPrice } from '../constants/format';

export default function MyProductCard({ product, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex space-x-4">
      <img src={product.thumbnail} alt={product.name} className="w-24 h-24 rounded-md object-cover"/>
      <div className="flex-grow flex flex-col">
        <p className="text-sm text-gray-500">{product.category}</p>
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(product.price)}원</p>
        <div className="mt-auto pt-2 flex space-x-2 self-end">
          <Link to={`/edit-product/${product.id}`} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
            수정
          </Link>
          <button onClick={() => onDelete(product.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}