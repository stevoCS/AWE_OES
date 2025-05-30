import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { isLoggedIn, cartItems } = useContext(CartContext);

  return (
    <div>
      <h1>Shopping Cart </h1>
      <p>{isLoggedIn ? 'Member Shopping Cart' : 'Guest Shopping Cart'}</p>
      <ul>
        {cartItems.length === 0 ? (
          <li>Shopping Cart is empty</li>
        ) : (
          cartItems.map((item, idx) => <li key={idx}>{item.name} x {item.qty}</li>)
        )}
      </ul>
    </div>
  );
};

export default Cart; 