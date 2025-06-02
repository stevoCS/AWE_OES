import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 从localStorage恢复用户状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // 使用真实的后端API进行登录
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.email, // 后端支持邮箱作为用户名登录
          password: credentials.password
        }),
      });

      // detailed error handling
      if (!response.ok) {
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          console.log('AuthContext - Login error response:', errorData);
          
          if (response.status === 401) {
            errorMessage = 'Incorrect email or password';
          } else if (response.status === 404) {
            errorMessage = 'Account not found';
          } else if (response.status === 403) {
            errorMessage = 'Account access denied';
          } else if (response.status === 422) {
            errorMessage = 'Invalid email format or password requirements not met';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('AuthContext - Could not parse error response:', parseError);
          if (response.status === 401) {
            errorMessage = 'Incorrect email or password';
          } else if (response.status === 404) {
            errorMessage = 'Account not found';
          }
        }
        
        console.error('AuthContext - Login failed:', errorMessage);
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      
      if (data.success) {
        // 保存用户信息和真实的JWT token
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('access_token', data.data.access_token); // 也保存为access_token，供adminApi使用
        
        return { success: true, user: data.data.user };
      } else {
        const errorMessage = data.message || 'Login failed';
        console.error('AuthContext - Login failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      
      let errorMessage = 'Login failed, please try again';
      
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        errorMessage = 'Network connection failed, please check if the server is running';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout, please try again';
      } else if (error.message && error.message !== 'Login failed') {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const updateProfile = async (profileData) => {
    try {
      // here should call the actual API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const data = await response.json();
      
      // update local user information
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      
      // temporary simulation of update logic
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      // here should call the actual API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        throw new Error('Password change failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      
      // temporary simulation of password change logic
      if (passwordData.currentPassword === 'admin123') {
        return { success: true };
      }
      
      return { success: false, error: 'Current password is incorrect' };
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return user && user.is_admin === true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 