import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
