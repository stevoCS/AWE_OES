import React, { createContext, useContext, useState, useEffect } from 'react';

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
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
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
    }
  }, [user]);

  // Register cart callbacks
  const registerCartCallbacks = (mergeCallback, logoutCallback) => {
    setCartMergeCallback(() => mergeCallback);
    setCartLogoutCallback(() => logoutCallback);
  };

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // TODO: This should call the actual API
      // It's just simulating login now.
      if (email && password) {
        const userData = {
          id: Date.now(), // Temporary ID
          email: email,
          firstName: email.split('@')[0], // Extract name from email
          lastName: 'User',
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        
        // Merge guest cart with user cart after successful login
        if (cartMergeCallback) {
          cartMergeCallback();
        }
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Email and password cannot be empty' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed, please try again' };
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // TODO: This should call the actual API     
      // It's just simulating registration now.
      const newUser = {
        id: Date.now(), // Temporary ID
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        contactNumber: userData.contactNumber || '',
        shippingAddress: userData.shippingAddress || '',
        personalPreference: userData.personalPreference || '',
        registerTime: new Date().toISOString()
      };
      
      setUser(newUser);
      
      // Merge guest cart with user cart after successful registration
      if (cartMergeCallback) {
        cartMergeCallback();
      }
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed, please try again' };
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