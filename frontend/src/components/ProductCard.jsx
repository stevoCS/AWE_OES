import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src={product.image} alt={product.name} className="product-img" />
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-desc">{product.desc}</div>
        </div>
      </Link>
      <div className="product-info">
        <div className="product-price">${product.price.toLocaleString()}</div>
        <button className="add-cart-btn" onClick={() => onAddToCart(product)}>add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 