import React, { createContext, useContext, useState, useEffect } from 'react';
import { ordersAPI } from '../api/config';
import { useUser } from './UserContext';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user, registerOrderCallbacks } = useUser();

  // Load orders when user login state changes
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('OrderContext - User logged in, loading user orders for:', user.id || user.email);
      loadOrdersFromBackend();
    } else {
      console.log('OrderContext - User logged out, clearing orders state (preserving localStorage)');
      // Only clear the state, don't clear localStorage - orders should persist across logins
      setOrders([]);
    }
  }, [isLoggedIn, user?.id]);

  // Register order callbacks with UserContext
  useEffect(() => {
    if (registerOrderCallbacks) {
      // Register a callback that only clears state (not localStorage) for logout
      const logoutCallback = () => clearOrders(false); // false = don't clear localStorage
      registerOrderCallbacks(logoutCallback);
    }
  }, [registerOrderCallbacks]);

  // Get user-specific localStorage key
  const getUserOrdersKey = () => {
    let key;
    // Use  as identifier since it's uniqu nd mmutabe
    if (user && user.email) {
      // Use email hash or directly use email (remove special characters)
      const emailKey = user.email.replace(/[@\.]/g, '_');
      key = `userOrders_${emailKey}`;
    } else if (user && user.id) {
      // Use id only if there's no email (backwards compatibility)
      key = `userOrders_${user.id}`;
    } else {
      key = 'guestOrders'; // Fallback for guests
    }
    
    console.log('OrderContext - Generated localStorage key:', key, 'for user:', { id: user?.id, email: user?.email });
    return key;
  };

  const loadOrdersFromBackend = async () => {
    try {
      setIsLoading(true);
      console.log('OrderContext - Loading orders from backend for user:', user?.id || user?.email);
      
      const response = await ordersAPI.getOrders({
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        size: 100
      });
      
      if (response.success && response.data && response.data.items) {
        const backendOrders = response.data.items.map(order => ({
          id: order.order_number,
          orderNumber: order.order_number,
          date: new Date(order.created_at).toLocaleDateString(),
          total: order.total_amount,
          status: order.status,
          estimatedDelivery: order.expected_delivery_date ? 
            new Date(order.expected_delivery_date).toLocaleDateString() : 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          items: order.items || [],
          createdAt: order.created_at,
          userId: user?.id || user?.email // Associate with current user
        }));
        
        console.log('OrderContext - Loaded orders from backend:', backendOrders);
        setOrders(backendOrders);
        
        // Save to user-specific localStorage
        const userOrdersKey = getUserOrdersKey();
        localStorage.setItem(userOrdersKey, JSON.stringify(backendOrders));
      } else {
        console.log('OrderContext - No orders found in backend, checking localStorage');
        loadOrdersFromLocalStorage();
      }
    } catch (error) {
      console.error('OrderContext - Failed to load orders from backend:', error);
      // Fallback to localStorage if backend fails
      loadOrdersFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      const userOrdersKey = getUserOrdersKey();
      let savedOrders = localStorage.getItem(userOrdersKey);
      
      console.log('OrderContext - Loading from localStorage:');
      console.log('  - Key:', userOrdersKey);
      console.log('  - Raw data:', savedOrders);
      
      // If current key has no data, try to migrate old data
      if (!savedOrders && user && user.email) {
        console.log('OrderContext - No data found, attempting to migrate old data...');
        
        // Try to migrate data from old ID key
        if (user.id) {
          const oldIdKey = `userOrders_${user.id}`;
          const oldIdData = localStorage.getItem(oldIdKey);
          if (oldIdData) {
            console.log('OrderContext - Found old data with ID key:', oldIdKey);
            savedOrders = oldIdData;
            // Save to new key
            localStorage.setItem(userOrdersKey, oldIdData);
            // Delete old key
            localStorage.removeItem(oldIdKey);
            console.log('OrderContext - Migrated data from', oldIdKey, 'to', userOrdersKey);
          }
        }
        
        // Try to migrate data from old email key (if format is different)
        const oldEmailKey = `userOrders_${user.email}`;
        if (oldEmailKey !== userOrdersKey) {
          const oldEmailData = localStorage.getItem(oldEmailKey);
          if (oldEmailData && !savedOrders) {
            console.log('OrderContext - Found old data with email key:', oldEmailKey);
            savedOrders = oldEmailData;
            // Save to new key
            localStorage.setItem(userOrdersKey, oldEmailData);
            // Delete old key
            localStorage.removeItem(oldEmailKey);
            console.log('OrderContext - Migrated data from', oldEmailKey, 'to', userOrdersKey);
          }
        }
      }
      
      console.log('  - All localStorage keys:', Object.keys(localStorage));
      
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        console.log('OrderContext - Successfully loaded orders from localStorage:', parsedOrders);
        setOrders(parsedOrders);
      } else {
        console.log('OrderContext - No saved orders found for key:', userOrdersKey);
        
        // Let's check if there are any order keys in localStorage
        const allKeys = Object.keys(localStorage);
        const orderKeys = allKeys.filter(key => key.startsWith('userOrders_'));
        console.log('OrderContext - Available order keys in localStorage:', orderKeys);
        
        setOrders([]);
      }
    } catch (error) {
      console.error('OrderContext - Failed to load orders from localStorage:', error);
      setOrders([]);
    }
  };

  const addOrder = async (orderData) => {
    console.log('OrderContext - Adding order for user:', user?.id || user?.email, orderData);
    
    // Create comprehensive order record with all information
    const newOrder = {
      id: orderData.orderNumber || orderData.id,
      orderNumber: orderData.orderNumber || orderData.id,
      date: orderData.date || new Date().toLocaleDateString(),
      orderDate: orderData.orderDate || orderData.createdAt || new Date().toISOString(),
      total: orderData.total,
      status: orderData.status || 'Processing',
      estimatedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items: orderData.items || [],
      // Complete address information
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      createdAt: orderData.createdAt || new Date().toISOString(),
      userId: user?.id || user?.email // Associate with current user
    };

    // If user is logged in, save to backend
    if (isLoggedIn && user) {
      try {
        console.log('OrderContext - Saving order to backend for user:', user?.id || user?.email);
        
        // Convert order data to backend format
        const backendOrderData = {
          payment_method: orderData.paymentMethod === 'card' ? 'credit_card' : 
                          orderData.paymentMethod === 'paypal' ? 'paypal' : 'credit_card',
          shipping_address: {
            recipient_name: orderData.shippingAddress?.fullName || 'Customer',
            phone: orderData.shippingAddress?.phone || '',
            address_line1: orderData.shippingAddress?.street || '',
            address_line2: '',
            city: orderData.shippingAddress?.city || '',
            state: orderData.shippingAddress?.state || '',
            postal_code: orderData.shippingAddress?.postalCode || '',
            country: orderData.shippingAddress?.country || 'Australia'
          },
          notes: `Order created via frontend payment - Payment Method: ${orderData.paymentMethod || 'card'}`
        };
        
        console.log('OrderContext - Backend order data:', backendOrderData);
        
        const response = await ordersAPI.createOrder(backendOrderData);
        
        if (response.success && response.data) {
          console.log('OrderContext - Order saved to backend successfully:', response.data);
          
          // Update the order with backend data
          newOrder.id = response.data.order_number;
          newOrder.orderNumber = response.data.order_number;
          newOrder.status = response.data.status;
          newOrder.createdAt = response.data.created_at;
          newOrder.total = response.data.total_amount;
        }
      } catch (error) {
        console.error('OrderContext - Failed to save order to backend:', error);
        console.error('OrderContext - Error details:', error.message);
        // Continue with local storage as fallback
      }
    }

    // Update local state
    setOrders(prevOrders => {
      const updatedOrders = [newOrder, ...prevOrders];
      console.log('OrderContext - Updated orders array for user:', user?.id || user?.email, updatedOrders);
      
      // Save to user-specific localStorage
      const userOrdersKey = getUserOrdersKey();
      console.log('OrderContext - Saving orders to localStorage:');
      console.log('  - Key:', userOrdersKey);
      console.log('  - Orders count:', updatedOrders.length);
      console.log('  - New order:', newOrder);
      
      localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
      
      // Verify the save
      const verification = localStorage.getItem(userOrdersKey);
      console.log('OrderContext - Verification - orders saved successfully:', verification ? 'YES' : 'NO');
      
      return updatedOrders;
    });
    
    console.log('OrderContext - Order added successfully:', newOrder);
    return newOrder;
  };

  const getOrderById = (orderId) => {
    const order = orders.find(order => order.orderNumber === orderId);
    
    // Security check: ensure order belongs to current user
    if (order && user && order.userId && order.userId !== user.id && order.userId !== user.email) {
      console.warn('OrderContext - Attempted to access order from different user');
      return null;
    }
    
    return order;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Security check: ensure order belongs to current user
    const order = getOrderById(orderId);
    if (!order) {
      console.warn('OrderContext - Cannot update order: not found or access denied');
      return;
    }

    // Update local state first
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order.orderNumber === orderId 
          ? { ...order, status: newStatus }
          : order
      );
      
      // Save to user-specific localStorage
      const userOrdersKey = getUserOrdersKey();
      localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
      
      return updatedOrders;
    });

    // If user is logged in, update backend
    if (isLoggedIn && user) {
      try {
        await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
        console.log('OrderContext - Order status updated in backend');
      } catch (error) {
        console.error('OrderContext - Failed to update order status in backend:', error);
      }
    }
  };

  const clearOrders = (clearLocalStorage = false) => {
    console.log('OrderContext - Clearing orders', clearLocalStorage ? '(including localStorage)' : '(state only)');
    setOrders([]);
    
    // Only clear localStorage if explicitly requested (e.g., account deletion)
    if (clearLocalStorage && user) {
      const userOrdersKey = getUserOrdersKey();
      localStorage.removeItem(userOrdersKey);
      console.log('OrderContext - Cleared orders from localStorage for user:', user.id || user.email);
    }
  };

  const value = {
    orders,
    isLoading,
    addOrder,
    getOrderById,
    updateOrderStatus,
    clearOrders,
    loadOrdersFromBackend
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}; 