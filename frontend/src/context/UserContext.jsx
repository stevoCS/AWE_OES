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
  const [orderLogoutCallback, setOrderLogoutCallback] = useState(null);

  // Restore user status from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      // 尝试从旧的通用键恢复数据（向后兼容）
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData.email) {
            // 迁移到新的email特定键
            const emailKey = userData.email.replace(/[@\.]/g, '_');
            const userDataKey = `userData_${emailKey}`;
            localStorage.setItem(userDataKey, savedUser);
            console.log('Migrated user data to email-specific key:', userDataKey);
          }
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Save user status to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // When user is null (logout), check if we should preserve custom data
      const preservedCustomData = localStorage.getItem('userCustomData');
      if (preservedCustomData) {
        // Keep the preserved custom data but clear authentication tokens
        console.log('User logged out - preserving custom data for next login');
      } else {
        // No custom data to preserve, safe to clear everything
        localStorage.removeItem('user');
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, [user]);

  // Register cart callbacks - fix infinite loop issue
  const registerCartCallbacks = useCallback((mergeCallback, logoutCallback) => {
    setCartMergeCallback(() => mergeCallback);
    setCartLogoutCallback(() => logoutCallback);
  }, []);

  // Register order callbacks
  const registerOrderCallbacks = useCallback((logoutCallback) => {
    setOrderLogoutCallback(() => logoutCallback);
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
        
      
        const emailKey = email.replace(/[@\.]/g, '_');
        const userDataKey = `userData_${emailKey}`;
        const customDataKey = `userCustomData_${emailKey}`;
        
        // Check if there's existing user data for this email
        const existingUserData = localStorage.getItem(userDataKey);
        const preservedCustomData = localStorage.getItem(customDataKey);
        let savedCustomData = {};
        
        // First try to get custom data from the email-specific preserved storage
        if (preservedCustomData) {
          try {
            savedCustomData = JSON.parse(preservedCustomData);
            console.log('Login - Found preserved custom data for', email, ':', savedCustomData);
            // Do not delete immediately, preserve backup until login is confirmed
          } catch (error) {
            console.log('Could not parse preserved custom data');
          }
        }
        // Fallback to existing user data if no preserved data
        else if (existingUserData) {
          try {
            const parsedData = JSON.parse(existingUserData);
            // Preserve custom data like avatar, bio, phone, etc.
            savedCustomData = {
              avatar: parsedData.avatar,
              bio: parsedData.bio,
              phone: parsedData.phone,
              // Preserve any other custom fields the user might have modified
              ...Object.fromEntries(
                Object.entries(parsedData).filter(([key]) => 
                  !['id', 'email', 'firstName', 'lastName', 'fullName', 'username', 'loginTime', 'registerTime'].includes(key)
                )
              )
            };
            console.log('Login - Found custom data in existing user data:', savedCustomData);
          } catch (error) {
            console.log('Could not parse existing user data, using fresh data');
          }
        }
        
        // Format user data to match frontend expectations, preserving custom data
        const formattedUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.full_name.split(' ')[0] || '',
          lastName: userData.full_name.split(' ').slice(1).join(' ') || '',
          fullName: userData.full_name,
          username: userData.username,
          loginTime: new Date().toISOString(),
          // Merge preserved custom data
          ...savedCustomData
        };
        
        // Try to get updated profile from backend
        try {
          const profileResponse = await authAPI.getProfile();
          if (profileResponse.success && profileResponse.data) {
            const backendProfile = profileResponse.data;
            console.log('Login - Retrieved updated profile from backend:', backendProfile);
            
            // Merge backend profile data with formatted user data
            formattedUser.phone = backendProfile.phone || savedCustomData.phone || '';
            formattedUser.bio = backendProfile.bio || savedCustomData.bio || '';
            formattedUser.avatar = backendProfile.avatar || savedCustomData.avatar || null;
          }
        } catch (profileError) {
          console.warn('Login - Could not fetch updated profile:', profileError.message);
          // Continue with existing saved data
        }
        
        setUser(formattedUser);
        
        // Save user data to email-specific key
        localStorage.setItem(userDataKey, JSON.stringify(formattedUser));
        
        // Clean up old generic key (backwards compatibility)
        localStorage.removeItem('user');
        localStorage.removeItem('userCustomData');
        
        // Only clear temporary saved custom data after successful login
        if (preservedCustomData) {
          localStorage.removeItem(customDataKey);
        }
        
        // Merge guest cart with user cart after successful login
        if (cartMergeCallback && typeof cartMergeCallback === 'function') {
          await cartMergeCallback();
        }
        
        console.log('Login successful, preserved user custom data:', formattedUser);
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
        
        // Check if there's existing user data in localStorage (less common but possible)
        const existingUserData = localStorage.getItem('user');
        let savedCustomData = {};
        
        if (existingUserData) {
          try {
            const parsedData = JSON.parse(existingUserData);
            // Preserve any custom data that might exist
            savedCustomData = {
              ...Object.fromEntries(
                Object.entries(parsedData).filter(([key]) => 
                  !['id', 'email', 'firstName', 'lastName', 'fullName', 'username', 'loginTime', 'registerTime'].includes(key)
                )
              )
            };
          } catch (error) {
            console.log('Could not parse existing user data during registration');
          }
        }
        
        // Format user data to match frontend expectations, preserving any custom data
        const formattedUser = {
          id: newUserData.id,
          email: newUserData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: newUserData.full_name,
          username: newUserData.username,
          registerTime: new Date().toISOString(),
          // Merge any preserved custom data
          ...savedCustomData
        };
        
        setUser(formattedUser);
        
        // Merge guest cart with user cart after successful registration
        if (cartMergeCallback && typeof cartMergeCallback === 'function') {
          await cartMergeCallback();
        }
        
        console.log('Registration successful, user data:', formattedUser);
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
    console.log('UserContext - logout function called');
    console.log('UserContext - current user:', user);
    console.log('UserContext - cartLogoutCallback:', cartLogoutCallback);
    console.log('UserContext - orderLogoutCallback:', orderLogoutCallback);
    
    // Clear user cart before logout
    if (cartLogoutCallback && typeof cartLogoutCallback === 'function') {
      console.log('UserContext - calling cartLogoutCallback');
      cartLogoutCallback();
    }
    
    // Clear user orders before logout
    if (orderLogoutCallback && typeof orderLogoutCallback === 'function') {
      console.log('UserContext - calling orderLogoutCallback');
      orderLogoutCallback();
    }
    
    // Preserve custom user data (avatar, bio, phone, etc.) in email-specific localStorage
    if (user && user.email) {
      console.log('UserContext - preserving custom user data for', user.email);
      const customDataToPreserve = {
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        // Preserve any other custom fields the user might have modified
        ...Object.fromEntries(
          Object.entries(user).filter(([key]) => 
            !['id', 'email', 'firstName', 'lastName', 'fullName', 'username', 'loginTime', 'registerTime'].includes(key)
          )
        )
      };
      
      // Only save if there's actually custom data to preserve
      if (Object.values(customDataToPreserve).some(value => value != null && value !== '')) {
        const emailKey = user.email.replace(/[@\.]/g, '_');
        const customDataKey = `userCustomData_${emailKey}`;
        try {
          localStorage.setItem(customDataKey, JSON.stringify(customDataToPreserve));
          console.log('Logout - Preserved custom user data for', user.email, ':', customDataToPreserve);
        } catch (error) {
          console.error('Logout - Error preserving custom data:', error);
        }
      }
    }
    
    console.log('UserContext - clearing user state and localStorage');
    
    // Immediately clear user state
    setUser(null);
    
    // Force clean up all authentication-related localStorage
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
    // Clean up all possible user data keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userData_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('UserContext - localStorage cleaned successfully');
    } catch (error) {
      console.error('UserContext - Error cleaning localStorage:', error);
    }
    
    console.log('UserContext - logout completed');
  };

  // Update user information
  const updateUser = async (updates) => {
    try {
      if (user) {
        console.log('UserContext - Updating user with:', updates);
        
        // First, try to update user data on the backend
        try {
          const response = await authAPI.updateProfile(updates);
          if (response.success) {
            console.log('UserContext - Backend update successful:', response.data);
          } else {
            console.warn('UserContext - Backend update failed:', response.message);
            // Continue with frontend update even if backend fails
          }
        } catch (apiError) {
          console.warn('UserContext - Backend API error:', apiError.message);
          // Continue with frontend update even if API call fails
        }
        
        // Update frontend state regardless of backend result
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Save to email-specific localStorage key
        if (user.email) {
          const emailKey = user.email.replace(/[@\.]/g, '_');
          const userDataKey = `userData_${emailKey}`;
          localStorage.setItem(userDataKey, JSON.stringify(updatedUser));
          console.log('UserContext - User updated and saved to', userDataKey, ':', updatedUser);
        } else {
          // Fallback to generic key if no email
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        console.log('UserContext - User updated successfully:', updatedUser);
        return { success: true, user: updatedUser };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      console.error('UserContext - Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
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
    registerCartCallbacks,
    registerOrderCallbacks
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 