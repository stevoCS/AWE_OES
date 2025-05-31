// Get API base URL from environment variables or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    
    const response = await fetch(url, requestOptions);
    
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
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection failed, please check if the backend service is running');
    }
    
    // Other errors are thrown directly
    throw error;
  }
};

// User authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await apiRequest('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.email.split('@')[0], // Use the email prefix as the username
        email: userData.email,
        full_name: `${userData.firstName} ${userData.lastName}`,
        password: userData.password,
      }),
    });
    return response;
  },

  login: async (email, password) => {
    const response = await apiRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        username: email.split('@')[0], // Use the email prefix as the username
        password: password,
      }),
    });
    return response;
  },

  updateProfile: async (userData) => {
    const response = await apiRequest('/api/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        bio: userData.bio,
        avatar: userData.avatar,
      }),
    });
    return response;
  },

  getProfile: async () => {
    const response = await apiRequest('/api/auth/profile/');
    return response;
  },
};

// Product API
export const productsAPI = {
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/products/${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  getProduct: async (productId) => {
    return await apiRequest(`/api/products/${productId}`);
  },

  getCategories: async () => {
    return await apiRequest('/api/products/meta/categories/');
  },
};

  // Shopping cart API
export const cartAPI = {
  getCartSummary: async () => {
    return await apiRequest('/api/cart/summary/');
  },

  addToCart: async (productId, quantity) => {
    return await apiRequest('/api/cart/items/', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });
  },

  updateCartItem: async (productId, quantity) => {
    return await apiRequest(`/api/cart/items/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: quantity,
      }),
    });
  },

  removeFromCart: async (productId) => {
    return await apiRequest(`/api/cart/items/${productId}/`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return await apiRequest('/api/cart/', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderData) => {
    return await apiRequest('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/orders/${queryString ? `?${queryString}` : ''}`;
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