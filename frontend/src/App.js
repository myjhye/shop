import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './page/Home';
import Login from './page/Login';
import Register from './page/Register';
import AddProduct from './page/AddProduct';
import ProductDetail from './page/ProductDetail';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}