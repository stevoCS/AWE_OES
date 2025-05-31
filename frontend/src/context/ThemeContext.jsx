import React, { createContext, useState, useContext, useEffect } from 'react';

// Theme configuration
export const themes = {
  light: {
    // Primary colors
    primary: '#0D80F2',
    primaryHover: '#0a68c4',
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f0f2f5',
    
    // Text colors
    textPrimary: '#121417',
    textSecondary: '#607589',
    textTertiary: '#61758A',
    textMuted: '#9ca3af',
    
    // Border colors
    border: '#e5e8eb',
    borderLight: '#f0f2f5',
    borderDark: '#d1d5db',
    
    // Status colors
    success: '#16a34a',
    error: '#dc2626',
    warning: '#ea580c',
    info: '#0D80F2',
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.1)',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    shadowLight: '0 1px 3px rgba(0, 0, 0, 0.1)',
    
    // Navigation and components
    headerBg: '#ffffff',
    headerBorder: '#e5e8eb',
    cardBg: '#ffffff',
    inputBg: '#ffffff',
    buttonBg: '#ffffff',
    
    // Component-specific colors
    cartBadge: '#16a34a',
    placeholderBg: '#f0f2f5',
    linkColor: '#0D80F2',
    linkHover: '#0a68c4'
  },
  dark: {
    // Primary colors
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    
    // Background colors
    background: '#111827',
    backgroundSecondary: '#1f2937',
    backgroundTertiary: '#374151',
    
    // Text colors
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textMuted: '#6b7280',
    
    // Border colors
    border: '#374151',
    borderLight: '#4b5563',
    borderDark: '#1f2937',
    
    // Status colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.3)',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    shadowLight: '0 1px 3px rgba(0, 0, 0, 0.2)',
    
    // Navigation and components
    headerBg: '#1f2937',
    headerBorder: '#374151',
    cardBg: '#1f2937',
    inputBg: '#374151',
    buttonBg: '#374151',
    
    // Component-specific colors
    cartBadge: '#22c55e',
    placeholderBg: '#374151',
    linkColor: '#60a5fa',
    linkHover: '#3b82f6'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage, default to light
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('awe-theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Get current theme configuration
  const theme = themes[currentTheme];

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
  };

  // Set specific theme
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  // Save theme settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awe-theme', currentTheme);
      
      // Add theme class to body for global styling
      document.body.className = `theme-${currentTheme}`;
      
      // Update CSS variables
      const root = document.documentElement;
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      });
    }
  }, [currentTheme, theme]);

  // Detect system theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        // Only follow system theme if user hasn't manually set a theme
        const savedTheme = localStorage.getItem('awe-theme');
        if (!savedTheme) {
          setCurrentTheme(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      
      // Initial check
      const savedTheme = localStorage.getItem('awe-theme');
      if (!savedTheme) {
        setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      }

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const value = {
    currentTheme,
    theme,
    toggleTheme,
    setTheme,
    isDark: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};