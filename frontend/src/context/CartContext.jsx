import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn, registerCartCallbacks } = useUser();
  const [guestCart, setGuestCart] = useState([]);
  const [userCart, setUserCart] = useState([]);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    // Load guest cart from localStorage
    const savedGuestCart = localStorage.getItem('guestCart');
    if (savedGuestCart) {
      try {
        const parsedCart = JSON.parse(savedGuestCart);
        setGuestCart(parsedCart);
      } catch (error) {
        console.error('Error parsing guest cart from localStorage:', error);
        setGuestCart([]);
      }
    }

    // Load user cart from localStorage if logged in
    if (isLoggedIn && user?.email) {
      const userCartKey = `userCart_${user.email}`;
      const savedUserCart = localStorage.getItem(userCartKey);
      if (savedUserCart) {
        try {
          const parsedCart = JSON.parse(savedUserCart);
          setUserCart(parsedCart);
        } catch (error) {
          console.error('Error parsing user cart from localStorage:', error);
          setUserCart([]);
        }
      }
    }
  }, [isLoggedIn, user?.email]);

  // Register cart callbacks with UserContext on mount
  useEffect(() => {
    if (registerCartCallbacks) {
      registerCartCallbacks(mergeGuestCartWithUserCart, handleLogout);
    }
  }, [registerCartCallbacks]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }, [guestCart]);

  // Save user cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const userCartKey = `userCart_${user.email}`;
      localStorage.setItem(userCartKey, JSON.stringify(userCart));
    }
  }, [userCart, isLoggedIn, user?.email]);

  // Get current cart based on login status
  const getCurrentCart = useCallback(() => {
    return isLoggedIn ? userCart : guestCart;
  }, [isLoggedIn, userCart, guestCart]);

  const setCurrentCart = useCallback((newCart) => {
    if (isLoggedIn) {
      setUserCart(newCart);
    } else {
      setGuestCart(newCart);
    }
  }, [isLoggedIn]);

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1) => {
    const currentCart = getCurrentCart();
    const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
    
    let newCart;
    if (existingItemIndex >= 0) {
      // Item already exists, update quantity
      newCart = currentCart.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // New item, add to cart
      newCart = [...currentCart, { ...product, quantity }];
    }
    
    setCurrentCart(newCart);
    console.log('Added to cart:', product.name, 'x', quantity);
  }, [getCurrentCart, setCurrentCart]);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    const currentCart = getCurrentCart();
    const newCart = currentCart.filter(item => item.id !== productId);
    setCurrentCart(newCart);
  }, [getCurrentCart, setCurrentCart]);

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const currentCart = getCurrentCart();
    const newCart = currentCart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCurrentCart(newCart);
  }, [getCurrentCart, setCurrentCart, removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCurrentCart([]);
  }, [setCurrentCart]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    const currentCart = getCurrentCart();
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [getCurrentCart]);

  // Get cart items count
  const getCartItemsCount = useCallback(() => {
    const currentCart = getCurrentCart();
    return currentCart.reduce((count, item) => count + item.quantity, 0);
  }, [getCurrentCart]);

  // When user logs in, merge guest cart with user cart
  const mergeGuestCartWithUserCart = useCallback(() => {
    if (guestCart.length > 0) {
      const mergedCart = [...userCart];
      
      guestCart.forEach(guestItem => {
        const existingItemIndex = mergedCart.findIndex(item => item.id === guestItem.id);
        if (existingItemIndex >= 0) {
          mergedCart[existingItemIndex].quantity += guestItem.quantity;
        } else {
          mergedCart.push(guestItem);
        }
      });
      
      setUserCart(mergedCart);
      setGuestCart([]); // Clear guest cart after merge
      localStorage.removeItem('guestCart');
    }
  }, [guestCart, userCart]);

  // When user logs out, clear user cart
  const handleLogout = useCallback(() => {
    setUserCart([]);
    if (user?.email) {
      localStorage.removeItem(`userCart_${user.email}`);
    }
  }, [user?.email]);

  const value = {
    cartItems: getCurrentCart(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    mergeGuestCartWithUserCart,
    handleLogout,
    isLoggedIn
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 