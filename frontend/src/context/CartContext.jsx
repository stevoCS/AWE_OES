import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // set default to guest
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // set default to empty cart
  const [cartItems, setCartItems] = useState([]);

  // switch login status
  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setCartItems([]); // clear cart when logout
  };

  // add item to cart
  const addToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
  };

  // remove item from cart
  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider value={{ isLoggedIn, cartItems, login, logout, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}; 