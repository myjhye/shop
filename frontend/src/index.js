import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import './index.css';
import { StompProvider } from './context/StompContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 모든 Provider를 이곳, App 컴포넌트의 바깥으로 옮긴다
root.render(
  //<React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StompProvider>
          <NotificationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotificationProvider>
        </StompProvider>
      </AuthProvider>
    </BrowserRouter>
  //</React.StrictMode>
);