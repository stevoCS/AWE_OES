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
        const backendOrders = response.data.items.map(order => {
          // Map backend item structure to frontend structure
          const mappedItems = (order.items || []).map((item, index) => {
            console.log(`OrderContext - Mapping backend item ${index}:`, item);
            
            // Create proper frontend item structure
            const mappedItem = {
              id: item.product_id || `item-${index}`,
              name: item.product_name || 'Unknown Product',
              price: Number(item.product_price) || 0,
              quantity: Number(item.quantity) || 1,
              // Add additional properties for compatibility
              productId: item.product_id,
              product_name: item.product_name, // Keep original for image mapping
              product_price: item.product_price // Keep original for reference
            };
            
            console.log(`OrderContext - Mapped frontend item ${index}:`, mappedItem);
            return mappedItem;
          });

          // Map status to frontend format
          const statusMapping = {
            'pending': 'Processing',
            'paid': 'Processing', 
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'refunded': 'Cancelled'
          };

          return {
            id: order.order_number,
            orderNumber: order.order_number,
            date: new Date(order.created_at).toLocaleDateString(),
            total: Number(order.total_amount) || 0,
            status: statusMapping[order.status] || 'Processing',
            estimatedDelivery: order.expected_delivery_date ? 
              new Date(order.expected_delivery_date).toLocaleDateString() : 
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            items: mappedItems,
            createdAt: order.created_at,
            userId: user?.id || user?.email, // Associate with current user
            // Add additional order fields for OrderDetail.jsx compatibility
            shippingAddress: {
              fullName: order.shipping_address?.recipient_name || 'Customer',
              phone: order.shipping_address?.phone || '',
              street: order.shipping_address?.address_line1 || '',
              city: order.shipping_address?.city || '',
              state: order.shipping_address?.state || '',
              postalCode: order.shipping_address?.postal_code || '',
              country: order.shipping_address?.country || 'Australia'
            },
            paymentMethod: order.payment_method === 'credit_card' ? 'card' : 
                          order.payment_method === 'paypal' ? 'paypal' : 
                          order.payment_method === 'digital_wallet' ? 'apple_pay' : 'card',
            subtotal: Number(order.subtotal) || mappedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: Number(order.tax_amount) || 0,
            shipping: Number(order.shipping_fee) || 0
          };
        });
        
        console.log('OrderContext - Loaded and mapped orders from backend:', backendOrders);
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

    // If user is logged in, try to save to backend
    if (isLoggedIn && user) {
      try {
        console.log('OrderContext - Attempting to save order to backend for user:', user?.id || user?.email);
        
        // First, try to add items to cart if not already there
        if (orderData.items && orderData.items.length > 0) {
          console.log('OrderContext - Adding order items to cart before creating order');
          try {
            // Import CartContext functions
            const { addToCart } = await import('./CartContext');
            
            // Add each item to cart
            for (const item of orderData.items) {
              const productData = {
                id: item.id,
                name: item.name,
                price: item.price,
                images: item.image ? [item.image] : []
              };
              
              // This will add to cart if user is logged in
              // We don't await this to avoid blocking the order creation
              addToCart?.(productData, item.quantity).catch(err => {
                console.warn('OrderContext - Failed to add item to cart:', err);
              });
            }
            
            // Give a brief moment for cart operations to complete
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (cartError) {
            console.warn('OrderContext - Could not add items to cart:', cartError);
          }
        }
        
        // Convert order data to backend format for direct order creation
        const backendOrderData = {
          items: orderData.items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
          })),
          shipping_address: {
            recipient_name: orderData.shippingAddress?.fullName || user?.firstName || 'Customer',
            phone: orderData.shippingAddress?.phone || user?.phone || '',
            address_line1: orderData.shippingAddress?.street || '',
            address_line2: '',
            city: orderData.shippingAddress?.city || '',
            state: orderData.shippingAddress?.state || '',
            postal_code: orderData.shippingAddress?.postalCode || '',
            country: orderData.shippingAddress?.country || 'Australia'
          },
          payment_method: orderData.paymentMethod === 'card' ? 'credit_card' : 
                          orderData.paymentMethod === 'paypal' ? 'paypal' : 
                          orderData.paymentMethod === 'apple_pay' ? 'digital_wallet' : 'credit_card',
          subtotal: orderData.subtotal || 0,
          tax_amount: orderData.tax || 0,
          shipping_fee: orderData.shipping || 0,
          total_amount: orderData.total || 0,
          notes: `Direct order creation - Payment: ${orderData.paymentMethod || 'card'} - Total: $${orderData.total}`
        };
        
        console.log('OrderContext - Backend direct order data:', backendOrderData);
        
        // Use direct order creation API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/orders/direct`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(backendOrderData)
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('OrderContext - Order saved to backend successfully:', result.data);
          
          // Update the order with backend data
          newOrder.id = result.data.order_number || result.data.id;
          newOrder.orderNumber = result.data.order_number || result.data.id;
          newOrder.status = result.data.status || 'paid';
          newOrder.createdAt = result.data.created_at || new Date().toISOString();
          newOrder.total = result.data.total_amount || orderData.total;
          
          console.log('OrderContext - Order successfully synced with backend');
        } else {
          console.warn('OrderContext - Backend order creation failed, continuing with local storage');
        }
      } catch (error) {
        console.error('OrderContext - Failed to save order to backend:', error);
        console.error('OrderContext - Error details:', error.message);
        
        // Set status to indicate backend sync failed but order is valid locally
        newOrder.status = 'pending_sync';
        console.log('OrderContext - Order marked as pending sync, will try again later');
      }
    }

    // Update local state (always do this regardless of backend success)
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