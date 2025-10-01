// src/App.js (수정된 최종 코드)

import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import NotificationBell from './components/NotificationBell';
import Home from './page/Home';
import Login from './page/Login';
import Register from './page/Register';
import AddProduct from './page/AddProduct';
import ProductDetail from './page/ProductDetail';
import MyPage from './page/MyPage';
import EditProduct from './page/EditProduct';

export default function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route
          path="/cart"
          element={<Navigate to="/mypage?tab=cart" replace />}
        />
      </Routes>
      <NotificationBell />
    </div>
  );
}