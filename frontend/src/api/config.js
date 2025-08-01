/**
 * Regular User API Configuration File
 * 
 * Scope of Responsibilities:
 * - User Registration, Login, and Profile Management
 * - Product Browsing (No Authentication Required)
 * - Shopping Cart Management (Authentication Required)
 * - Order Creation and Viewing (Authentication Required)
 * 
 * Note: This file does not contain admin functionality, for admin features please use adminApi.js
 */

import { API_BASE_URL } from '../config/environment.js';

console.log('API Base URL:', API_BASE_URL);

// API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    // Add timeout configuration
    signal: options.signal, // Allow external abort controller
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log('Making API request to:', url);
    console.log('Request options:', requestOptions);
    
    // Create timeout controller if no external signal provided
    let controller = null;
    let timeoutId = null;
    
    if (!options.signal) {
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.log('Request timeout after 15 seconds');
        controller.abort();
      }, 15000); // 15 second timeout
      requestOptions.signal = controller.signal;
    }
    
    const response = await fetch(url, requestOptions);
    
    // Clear timeout on successful response
    if (timeoutId) clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Check if the response is successful
    if (!response.ok) {
      // Try to parse the error message
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (jsonError) {
        // If the JSON cannot be parsed, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    // Parse the successful response
    const data = await response.json();
    console.log('Response data:', data);
    return data;
    
  } catch (error) {
    console.error('API request failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      url: url,
      endpoint: endpoint
    });
    
    // Check if it's a timeout/abort error
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection or try again later.');
    }
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection failed, please check if the backend service is running');
    }
    
    // Check for specific network issues
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    // Other errors are thrown directly
    throw error;
  }
};

// User authentication API
export const authAPI = {
  register: async (userData) => {
    // Generate more unique username: email prefix + last 4 digits of timestamp
    const timestamp = Date.now().toString();
    const emailPrefix = userData.email.split('@')[0];
    const uniqueUsername = `${emailPrefix}_${timestamp.slice(-4)}`;
    
    const registrationData = {
      full_name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      password: userData.password,
      username: uniqueUsername
    };

    console.log('Registration data being sent:', registrationData);
    
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    if (response.success) {
      return {
        success: true,
        data: {
          user: response.data.user,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token
        }
      };
    } else {
      return { success: false, message: response.message };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Backend supports email as username for login
          password: password
        }),
      });

      if (response.success) {
        return {
          success: true,
          data: {
            user: response.data.user,
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
          }
        };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // return detailed error message instead of generic message
      let errorMessage = 'Login failed';
      
      if (error.message.includes('401')) {
        errorMessage = 'Incorrect email or password';
      } else if (error.message.includes('404')) {
        errorMessage = 'Account not found';
      } else if (error.message.includes('403')) {
        errorMessage = 'Account access denied';
      } else if (error.message.includes('422')) {
        errorMessage = 'Invalid email format or password requirements not met';
      } else if (error.message.includes('timeout') || error.message.includes('network')) {
        errorMessage = 'Network connection failed, please try again';
      } else if (error.message && error.message !== 'Login failed') {
        // if there is a specific error message, use it
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  },

  updateProfile: async (userData) => {
    const response = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response;
  },

  getProfile: async () => {
    const response = await apiRequest('/api/auth/profile');
    return response;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    return response;
  },
};

// Product API
export const productsAPI = {
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/products/?${queryString}` : '/api/products/';
    return await apiRequest(endpoint);
  },

  getProduct: async (productId) => {
    return await apiRequest(`/api/products/${productId}/`);
  },

  getCategories: async () => {
    return await apiRequest('/api/products/meta/categories');
  },
};

// Shopping cart API
export const cartAPI = {
  getCartSummary: async () => {
    return await apiRequest('/api/cart/summary');
  },

  addToCart: async (productId, quantity) => {
    return await apiRequest('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });
  },

  updateCartItem: async (productId, quantity) => {
    return await apiRequest(`/api/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: quantity,
      }),
    });
  },

  removeFromCart: async (productId) => {
    return await apiRequest(`/api/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return await apiRequest('/api/cart', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderData) => {
    return await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/orders?${queryString}` : '/api/orders';
    return await apiRequest(endpoint);
  },

  getOrder: async (orderId) => {
    return await apiRequest(`/api/orders/${orderId}`);
  },

  getOrderByNumber: async (orderNumber) => {
    return await apiRequest(`/api/orders/number/${orderNumber}`);
  },

  updateOrderStatus: async (orderId, statusData) => {
    return await apiRequest(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },

  cancelOrder: async (orderId) => {
    return await apiRequest(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },
};

export default API_BASE_URL; 