import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './page/Home';
import Login from './page/Login';
import Register from './page/Register';
import AddProduct from './page/AddProduct';
import ProductDetail from './page/ProductDetail';
import MyPage from './page/MyPage';
import EditProduct from './page/EditProduct';

export default function App() {
  return (
    <AuthProvider>
      <Router>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}