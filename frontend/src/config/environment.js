/**
 * AWE Electronics Environment Configuration
 * 
 * This file manages environment-specific settings for different deployment environments.
 * It automatically detects the current environment and sets appropriate API URLs.
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URLs for different environments
const API_URLS = {
  development: 'http://localhost:8000',
  production: 'https://awe-oes.onrender.com',
  // Fallback for custom environment variable
  custom: import.meta.env.VITE_API_BASE_URL
};

// Determine the current API base URL
export const getApiBaseUrl = () => {
  // First check for custom environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 Using custom API URL from environment:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Then check environment mode
  if (isDevelopment) {
    console.log('🟡 Development mode detected, using local API:', API_URLS.development);
    return API_URLS.development;
  }
  
  if (isProduction) {
    console.log('🟢 Production mode detected, using cloud API:', API_URLS.production);
    return API_URLS.production;
  }
  
  // Default fallback
  console.log('⚠️ Unknown environment, using development fallback');
  return API_URLS.development;
};

// Export the current API base URL
export const API_BASE_URL = getApiBaseUrl();

// Environment information
export const ENV_INFO = {
  mode: import.meta.env.MODE,
  isDevelopment,
  isProduction,
  apiBaseUrl: API_BASE_URL,
  appName: 'AWE Electronics',
  version: '1.0.0'
};

// Log environment information
console.log('🌍 Environment Configuration:', {
  mode: ENV_INFO.mode,
  isDevelopment: ENV_INFO.isDevelopment,
  isProduction: ENV_INFO.isProduction,
  apiBaseUrl: ENV_INFO.apiBaseUrl
});

export default ENV_INFO; 