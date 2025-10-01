// src/index.js (수정된 최종 코드)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 모든 Provider를 이곳, App 컴포넌트의 바깥으로 옮긴다
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);