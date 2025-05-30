import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { cartAPI } from '../api/config';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn, registerCartCallbacks } = useUser();
  const [guestCart, setGuestCart] = useState([]);
  const [userCart, setUserCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user cart from server
  const loadUserCartFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading cart from server...');
      
      const response = await cartAPI.getCartSummary();
      console.log('Cart API response:', response);
      
      if (response.success) {
        const serverCartItems = response.data.items.map(item => ({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          quantity: item.quantity,
          image: '/api/placeholder/150/150', // Default placeholder
          // Add other fields as needed
        }));
        setUserCart(serverCartItems);
        console.log('Successfully loaded cart:', serverCartItems.length, 'items');
      } else {
        console.warn('Cart API response format is incorrect:', response);
      }
    } catch (error) {
      console.error('Failed to load cart from server:', error);
      // Silent failure, does not affect app functionality
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When user logs in, merge guest cart with user cart
  const mergeGuestCartWithUserCart = useCallback(async () => {
    if (guestCart.length > 0) {
      try {
        setIsLoading(true);
        
        // Add all guest cart items to server
        for (const item of guestCart) {
          await cartAPI.addToCart(item.id, item.quantity);
        }
        
        // Clear guest cart and reload server cart
        setGuestCart([]);
        localStorage.removeItem('guestCart');
        await loadUserCartFromServer();
        
        console.log('Guest cart merged with user cart');
      } catch (error) {
        console.error('Failed to merge guest cart:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Just load user cart if no guest items
      await loadUserCartFromServer();
    }
  }, [guestCart, loadUserCartFromServer]);

  // When user logs out, clear user cart
  const handleLogout = useCallback(() => {
    setUserCart([]);
  }, []);

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
  }, []);

  // Load user cart from server when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadUserCartFromServer();
    } else {
      setUserCart([]);
    }
  }, [isLoggedIn, user?.id, loadUserCartFromServer]);

  // Simplified version: register callbacks directly, without useEffect
  React.useLayoutEffect(() => {
    if (registerCartCallbacks && typeof registerCartCallbacks === 'function') {
      registerCartCallbacks(mergeGuestCartWithUserCart, handleLogout);
    }
  }, []);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }, [guestCart]);

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
  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      setIsLoading(true);
      
      if (isLoggedIn) {
        // Add to server cart
        const response = await cartAPI.addToCart(product.id, quantity);
        if (response.success) {
          // Reload cart from server to get updated data
          await loadUserCartFromServer();
          console.log('Added to server cart:', product.name, 'x', quantity);
        }
      } else {
        // Add to guest cart (localStorage)
        const currentCart = guestCart;
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
        
        setGuestCart(newCart);
        console.log('Added to guest cart:', product.name, 'x', quantity);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Fallback to local cart for guest users
      if (!isLoggedIn) {
        const currentCart = guestCart;
        const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
        
        let newCart;
        if (existingItemIndex >= 0) {
          newCart = currentCart.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...currentCart, { ...product, quantity }];
        }
        
        setGuestCart(newCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, guestCart, loadUserCartFromServer]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      
      if (isLoggedIn) {
        // Remove from server cart
        await cartAPI.removeFromCart(productId);
        await loadUserCartFromServer();
      } else {
        // Remove from guest cart
        const newCart = guestCart.filter(item => item.id !== productId);
        setGuestCart(newCart);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // Fallback to local removal
      if (!isLoggedIn) {
        const newCart = guestCart.filter(item => item.id !== productId);
        setGuestCart(newCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, guestCart, loadUserCartFromServer]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isLoggedIn) {
        // Update on server
        await cartAPI.updateCartItem(productId, newQuantity);
        await loadUserCartFromServer();
      } else {
        // Update guest cart
        const newCart = guestCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        setGuestCart(newCart);
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      // Fallback to local update
      if (!isLoggedIn) {
        const newCart = guestCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        setGuestCart(newCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, guestCart, removeFromCart, loadUserCartFromServer]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isLoggedIn) {
        // Clear server cart
        await cartAPI.clearCart();
        setUserCart([]);
      } else {
        // Clear guest cart
        setGuestCart([]);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Fallback to local clear
      setCurrentCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, setCurrentCart]);

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
    isLoggedIn,
    isLoading,
    loadUserCartFromServer
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