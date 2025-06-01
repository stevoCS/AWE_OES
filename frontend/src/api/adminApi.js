/**
 * Admin API Configuration File
 * 
 * Scope of Responsibilities:
 * - Dashboard Statistics
 * - Product Management (CRUD Operations)
 * - Order Management (View All Orders, Update Status)
 * - Customer Management (View All Customer Information)
 * - System Settings Management
 * 
 * Permission Requirements: All APIs require admin authentication
 * 
 * Note: This file is for admin backend functionality only, for regular user functionality please use config.js
 */

// Admin API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// get authentication token
const getAuthToken = () => {
  // first try to find access_token (UserContext key)
  let token = localStorage.getItem('access_token');
  
  // if no access_token, try to find token (AuthContext key)
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  console.log('Admin API getAuthToken:', token ? 'Token found' : 'No token found');
  return token;
};

// generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Try to get more detailed error for 422
      if (response.status === 422) {
        try {
          const errorData = await response.json();
          console.error('422 Validation Error Details:', errorData);
          
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map(err => 
              `${err.loc?.join('.')} - ${err.msg}`
            ).join(', ');
            errorMessage = `Validation Error: ${validationErrors}`;
          } else if (errorData.detail) {
            errorMessage = `Validation Error: ${errorData.detail}`;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Dashboard API
export const dashboardApi = {
  // get dashboard statistics data
  getStats: async () => {
    try {
      const data = await apiRequest('/api/admin/dashboard/stats');
      return data;
    } catch (error) {
      // return mock data
      return {
        totalOrders: 1247,
        totalCustomers: 892,
        totalRevenue: 125430.50,
        totalProducts: 156,
        salesTrend: 12.5,
        customerTrend: 8.3,
        revenueTrend: 15.2,
        productTrend: 3.1,
        recentOrders: [
          {
            id: 'ORD-001',
            customer: 'John Doe',
            amount: 299.99,
            status: 'paid',
            date: '2024-01-15'
          },
          {
            id: 'ORD-002',
            customer: 'Jane Smith',
            amount: 159.50,
            status: 'processing',
            date: '2024-01-15'
          }
        ]
      };
    }
  }
};

// Orders API
export const ordersApi = {
  // get all orders
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/orders/admin/all?${queryString}` : '/api/orders/admin/all';
      const data = await apiRequest(endpoint);
      return data;
    } catch (error) {
      console.error('Admin orders API error:', error);
      // return mock data as fallback
      return {
        success: false,
        error: error.message,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        }
      };
    }
  },

  // update order status
  updateStatus: async (orderId, status) => {
    try {
      const data = await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return data;
    } catch (error) {
      console.error('Order status update error:', error);
      throw error;
    }
  },

  // get order details
  getById: async (orderIdOrNumber) => {
    try {
      // Determine if it's an order number (starts with AWE) or database ID
      let endpoint;
      if (typeof orderIdOrNumber === 'string' && orderIdOrNumber.startsWith('AWE')) {
        // It's an order number like AWE2506022280 - use admin endpoint
        endpoint = `/api/orders/admin/number/${orderIdOrNumber}`;
        console.log('Using admin order number endpoint:', endpoint);
      } else {
        // It's a database ID (ObjectId format)
        endpoint = `/api/orders/${orderIdOrNumber}`;
        console.log('Using order ID endpoint:', endpoint);
      }
      
      const data = await apiRequest(endpoint);
      return data;
    } catch (error) {
      console.error('Get order by ID/Number error:', error);
      throw error;
    }
  },

  // delete order
  delete: async (orderId) => {
    try {
      const data = await apiRequest(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Delete order error:', error);
      throw error;
    }
  },

  // archive order
  archive: async (orderId) => {
    try {
      const data = await apiRequest(`/api/orders/${orderId}/archive`, {
        method: 'PUT'
      });
      return data;
    } catch (error) {
      console.error('Archive order error:', error);
      throw error;
    }
  }
};

// Products API
export const productsApi = {
  // get all products
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
      const data = await apiRequest(endpoint);
      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // create product
  create: async (productData) => {
    try {
      const data = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return data;
    } catch (error) {
      console.error('Create product error:', error);
      console.error('Product data that failed:', productData);
      throw error;
    }
  },

  // update product
  update: async (productId, productData) => {
    try {
      const data = await apiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      return data;
    } catch (error) {
      console.error('Update product error:', error);
      console.error('Product ID:', productId);
      console.error('Product data that failed:', productData);
      
      // Try to parse error response for better error message
      if (error.message.includes('422')) {
        error.message = 'Validation failed: Please check your input data format';
      }
      throw error;
    }
  },

  // delete product
  delete: async (productId) => {
    try {
      const data = await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },

  // get product categories
  getCategories: async () => {
    try {
      const data = await apiRequest('/api/products/meta/categories');
      return data;
    } catch (error) {
      console.error('Get categories error:', error);
      // return fallback data
      return {
        success: true,
        data: ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio']
      };
    }
  }
};

// Customers API
export const customersApi = {
  // get all customers
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/customers?${queryString}` : '/api/customers';
      const data = await apiRequest(endpoint);
      return data;
    } catch (error) {
      console.error('Get customers error:', error);
      throw error; // throw the actual error instead of mock data
    }
  },

  // get customer details
  getById: async (customerId) => {
    try {
      const data = await apiRequest(`/api/customers/${customerId}`);
      return data;
    } catch (error) {
      console.error('Get customer details error:', error);
      throw error; // throw the actual error instead of mock data
    }
  },

    // get customer orders
  getOrders: async (customerId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/customers/${customerId}/orders?${queryString}` : `/api/customers/${customerId}/orders`;
      const data = await apiRequest(endpoint);
      return data;
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw error; // throw the actual error instead of mock data
    }
  },

  // update customer information
  update: async (customerId, customerData) => {
    try {
      const data = await apiRequest(`/api/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(customerData)
      });
      return data;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error; // throw the actual error instead of mock response
    }
  },

  // delete customer
  delete: async (customerId) => {
    try {
      const data = await apiRequest(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Delete customer error:', error);
      throw error; // throw the actual error instead of mock response
    }
  }
};

// Admin Settings API
export const adminApi = {
  // get admin information
  getProfile: async () => {
    try {
      const data = await apiRequest('/api/auth/profile');
      return data;
    } catch (error) {
      // mock data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        user: {
          id: user.id || 'admin-001',
          username: user.username || 'admin',
          email: user.email || 'admin@awe.com',
          full_name: user.full_name || 'System Administrator',
          phone: '+1234567890',
          address: '123 Admin St, Admin City, AC 12345',
          bio: 'System administrator for AWE Electronics',
          avatar: null,
          is_admin: true
        }
      };
    }
  },

  // update admin information
  updateProfile: async (profileData) => {
    try {
      const data = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      return data;
    } catch (error) {
      // mock success response
      return { success: true, message: 'Profile updated successfully' };
    }
  },

  // change password
  changePassword: async (passwordData) => {
    try {
      const data = await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      });
      return data;
    } catch (error) {
      // mock success response
      if (passwordData.currentPassword === 'admin123') {
        return { success: true, message: 'Password changed successfully' };
      }
      throw new Error('Current password is incorrect');
    }
  }
};

// Settings API
export const settingsApi = {
  // get system settings
  getAdminSettings: async () => {
    try {
      const data = await apiRequest('/api/admin/settings');
      return data;
    } catch (error) {
      // mock data
      return {
        success: true,
        data: {
          siteName: 'AWE Electronics',
          siteDescription: 'Your trusted electronics partner',
          contactEmail: 'contact@aweelectronics.com',
          supportPhone: '+1 (555) 123-4567',
          address: '123 Main Street, Tech City, TC 12345',
          currency: 'USD',
          timezone: 'America/New_York',
          allowRegistration: true,
          requireEmailVerification: true,
          enableNotifications: true
        }
      };
    }
  },

  // update system settings
  updateAdminSettings: async (settingsData) => {
    try {
      const data = await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });
      return data;
    } catch (error) {
      // mock success response
      return { success: true, message: 'Settings updated successfully' };
    }
  }
};

export default {
  dashboardApi,
  ordersApi,
  productsApi,
  customersApi,
  adminApi,
  settingsApi
}; 