import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/config';

// Create user context
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User status provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartMergeCallback, setCartMergeCallback] = useState(null);
  const [cartLogoutCallback, setCartLogoutCallback] = useState(null);

  // Restore user status from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    
    if (savedUser && accessToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user status to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, [user]);

  // Register cart callbacks - fix infinite loop issue
  const registerCartCallbacks = useCallback((mergeCallback, logoutCallback) => {
    setCartMergeCallback(mergeCallback);
    setCartLogoutCallback(logoutCallback);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userData = response.data.user;
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Format user data to match frontend expectations
        const formattedUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.full_name.split(' ')[0] || '',
          lastName: userData.full_name.split(' ').slice(1).join(' ') || '',
          fullName: userData.full_name,
          username: userData.username,
          loginTime: new Date().toISOString()
        };
        
        setUser(formattedUser);
        
        // Merge guest cart with user cart after successful login
        if (cartMergeCallback) {
          cartMergeCallback();
        }
        
        return { success: true, user: formattedUser };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed, please try again' };
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const newUserData = response.data.user;
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Format user data to match frontend expectations
        const formattedUser = {
          id: newUserData.id,
          email: newUserData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: newUserData.full_name,
          username: newUserData.username,
          registerTime: new Date().toISOString()
        };
        
        setUser(formattedUser);
        
        // Merge guest cart with user cart after successful registration
        if (cartMergeCallback) {
          cartMergeCallback();
        }
        
        return { success: true, user: formattedUser };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed, please try again' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear user cart before logout
    if (cartLogoutCallback) {
      cartLogoutCallback();
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Update user information
  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  // Check if the user is logged in
  const isLoggedIn = Boolean(user);

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    registerCartCallbacks
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 