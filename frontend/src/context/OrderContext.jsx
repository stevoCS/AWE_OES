import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('userOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('userOrders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData) => {
    console.log('OrderContext - Adding order:', orderData); // Debug log
    
    const newOrder = {
      id: orderData.orderNumber,
      orderNumber: orderData.orderNumber,
      date: orderData.orderDate,
      total: orderData.total,
      status: 'Processing', // Initial status
      estimatedDelivery: orderData.estimatedDelivery,
      items: orderData.items || [],
      createdAt: new Date().toISOString()
    };

    console.log('OrderContext - New order object:', newOrder); // Debug log
    setOrders(prevOrders => {
      const updatedOrders = [newOrder, ...prevOrders];
      console.log('OrderContext - Updated orders array:', updatedOrders); // Debug log
      return updatedOrders;
    });
    return newOrder;
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.orderNumber === orderId);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderNumber === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem('userOrders');
  };

  const value = {
    orders,
    addOrder,
    getOrderById,
    updateOrderStatus,
    clearOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}; 