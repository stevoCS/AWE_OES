// Debug tool - for tracking application state and navigation
export const DebugLogger = {
  log: (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 🔍 ${message}`, data || '');
  },

  error: (message, error = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] ❌ ${message}`, error || '');
  },

  success: (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ✅ ${message}`, data || '');
  },

  navigation: (from, to, method = 'navigate') => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 🧭 Navigation: ${from} → ${to} (via ${method})`);
  },

  apiCall: (method, url, status = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const statusText = status ? ` [${status}]` : '';
    console.log(`[${timestamp}] 🌐 API: ${method} ${url}${statusText}`);
  },

  userAction: (action, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 👤 User Action: ${action}`, data || '');
  }
};

// Global debug state
export const DEBUG_MODE = true;

// Wrap navigate function to add debug information
export const debugNavigate = (navigate, from, to) => {
  if (DEBUG_MODE) {
    DebugLogger.navigation(from, to, 'react-router');
  }
  return navigate(to);
};

// Wrap API calls to add debug information
export const debugApiCall = async (method, url, options = {}) => {
  if (DEBUG_MODE) {
    DebugLogger.apiCall(method, url);
  }
  
  try {
    const response = await fetch(url, { method, ...options });
    
    if (DEBUG_MODE) {
      DebugLogger.apiCall(method, url, response.status);
    }
    
    return response;
  } catch (error) {
    if (DEBUG_MODE) {
      DebugLogger.error(`API call failed: ${method} ${url}`, error);
    }
    throw error;
  }
}; 